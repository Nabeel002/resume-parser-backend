const pdf = require('pdf-parse')
const PDFDocument = require('pdfkit')
const model = require("../config/gemini");

exports.uploadResume = async ({
  userId,
  resume,
  jobDescription,
}) => {
  if (!resume) {
    throw new Error("Resume required");
  }

  const pdfData =
    await pdf(resume.buffer);

  const resumeText =
    pdfData.text;

  const prompt = `
You are a professional ATS resume writer.

You will receive:
1. A parsed resume
2. A job description

Your task:
- Optimize the resume to match the job description.

Respond with ONLY strict JSON. No markdown, no code fences, no explanations.
Use EXACTLY this shape:

{
  "name": "",
  "title": "",
  "contact": { "email": "", "phone": "", "linkedin": "", "location": "" },
  "summary": "",
  "skills": [],
  "experience": [{ "title": "", "company": "", "location": "", "dates": "", "bullets": [] }],
  "education": [{ "degree": "", "school": "", "dates": "" }],
  "certifications": []
}

Rules:
- Only include fields that exist in the original resume. Use empty strings/arrays if missing.
- Rewrite experience bullets to be strong, quantified, and ATS-friendly.
- Keep it to roughly one page.
`;

  const result =
    await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt + "\n\nRESUME:\n" + resumeText + "\n\nJOB DESCRIPTION:\n" + jobDescription }]
      }]
    });

  const raw =
    result.response.text();

  const resumeData =
    parseResumeJson(raw);

  const pdfBuffer =
    await generatePdf(resumeData);

  return {
    success: true,
    userId,
    optimizedResume: raw,
    resumeData,
    pdfBuffer,
  };
};

const parseResumeJson = (rawText) => {
  let text = rawText.trim();

  const fence =
    text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fence) text = fence[1].trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error(
        "Gemini did not return valid JSON"
      );
    }
    return JSON.parse(
      text.slice(start, end + 1)
    );
  }
};

const generatePdf = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 48,
    });
    const chunks = [];

    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const accent = "#1a1a2e";
    const dark = "#111111";
    const gray = "#555555";
    const lightGray = "#888888";

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const heading = (text) => {
      doc.moveDown(0.7);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(accent)
        .text(text.toUpperCase(), { characterSpacing: 1 });
      const y = doc.y + 3;
      doc
        .moveTo(margin, y)
        .lineTo(pageWidth - margin, y)
        .strokeColor(accent)
        .lineWidth(0.8)
        .stroke();
      doc.moveDown(0.4);
    };

    if (data.name) {
      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(dark)
        .text(data.name, { align: "center" });
    }

    if (data.title) {
      doc.moveDown(0.15);
      doc
        .font("Helvetica-Oblique")
        .fontSize(12)
        .fillColor(gray)
        .text(data.title, { align: "center" });
    }

    if (data.contact) {
      const parts = [
        data.contact.email,
        data.contact.phone,
        data.contact.linkedin,
        data.contact.location,
      ].filter(Boolean);
      if (parts.length) {
        doc.moveDown(0.2);
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(lightGray)
          .text(parts.join("   |   "), { align: "center" });
      }
    }

    doc.moveDown(0.8);

    if (data.summary) {
      heading("Professional Summary");
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#222222")
        .text(data.summary, { lineGap: 2 });
    }

    if (Array.isArray(data.skills) && data.skills.length) {
      heading("Skills");
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#222222")
        .text(data.skills.join("   •   "), { lineGap: 2 });
    }

    if (Array.isArray(data.experience) && data.experience.length) {
      heading("Experience");
      data.experience.forEach((job) => {
        const title = job.title || "";
        const company = job.company || "";

        if (title && company) {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(title, margin, doc.y, { continued: true });
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(company, { align: "right" });
        } else {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(title || company);
        }

        const meta = [job.dates, job.location].filter(Boolean);
        if (meta.length) {
          doc
            .font("Helvetica-Oblique")
            .fontSize(9)
            .fillColor(lightGray)
            .text(meta.join("  |  "));
        }

        if (Array.isArray(job.bullets) && job.bullets.length) {
          doc.moveDown(0.2);
          job.bullets.forEach((bullet) => {
            doc
              .font("Helvetica")
              .fontSize(10)
              .fillColor("#222222")
              .text(`- ${bullet}`, { indent: 12, lineGap: 2 });
          });
        }

        doc.moveDown(0.4);
      });
    }

    if (Array.isArray(data.education) && data.education.length) {
      heading("Education");
      data.education.forEach((edu) => {
        const degree = edu.degree || "";
        const school = edu.school || "";

        if (degree && school) {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(degree, margin, doc.y, { continued: true });
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(school, { align: "right" });
        } else {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(dark)
            .text(degree || school);
        }

        if (edu.dates) {
          doc
            .font("Helvetica-Oblique")
            .fontSize(9)
            .fillColor(lightGray)
            .text(edu.dates);
        }

        doc.moveDown(0.3);
      });
    }

    if (
      Array.isArray(data.certifications) &&
      data.certifications.length
    ) {
      heading("Certifications");
      data.certifications.forEach((cert) => {
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor("#222222")
          .text(`- ${cert}`, { indent: 12, lineGap: 2 });
      });
    }

    doc.end();
  });
};