const pdf = require('pdf-parse')
const model =
  require("../config/gemini");

exports.uploadResume = async ({
  userId,
  resume,
  jobDescription,
  latexTemplate
}) => {

  if (!resume) {
    throw new Error(
      "Resume required"
    );
  }

  // Extract PDF Text
  const pdfData =
    await pdf(resume.buffer);

  const resumeText =
    pdfData.text;

  // Gemini Prompt
const prompt = `
You are a professional ATS resume writer.

You will receive:

1. A LaTeX resume template
2. A parsed resume
3. A job description

Your task:
- Keep the SAME LaTeX structure and formatting
- ONLY modify the content
- Improve ATS optimization
- Improve bullet points
- Add relevant keywords
- Keep information truthful
- Return ONLY valid compilable LaTeX
- Do not add explanations
- Do not change layout unnecessarily

LATEX TEMPLATE:
${latexTemplate}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

  const result =
    await model.generateContent(
      prompt
    );

  const optimizedResume =
    result.response.text();

  return {
    success: true,
    userId,
    optimizedResume,
  };
};