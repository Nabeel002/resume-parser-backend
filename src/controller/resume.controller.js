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

      res.json(result);

    } catch (error) {

      res.status(400).json({
        error: error.message,
      });

    }
};