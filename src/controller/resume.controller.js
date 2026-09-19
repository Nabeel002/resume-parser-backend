const resumeService =
  require("../services/resume.service");

exports.uploadResume =
  async (req, res) => {

    try {
      const result =
        await resumeService
          .uploadResume({
            userId: req.user.id,
            resume: req.file,
            jobDescription:
              req.body.jobDescription,
          });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="optimized-resume.pdf"');
      res.send(result.pdfBuffer);

    } catch (error) {

      res.status(400).json({
        error: error.message,
      });

    }
};