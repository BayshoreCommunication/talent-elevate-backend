const express = require("express");
const {
  createResumeDetails,
  updateResumeDetails,
  deleteResumeDetails,
  getResumeDetails,
} = require("../controllers/resumeDetailsController");

const resumeDetialsRouter = express.Router();
const { isLoggedIn } = require("../middleware/auth");


resumeDetialsRouter.post("/create-resume-details", isLoggedIn, createResumeDetails);
resumeDetialsRouter.put("/update-resume-details", isLoggedIn, updateResumeDetails);
resumeDetialsRouter.delete("/delete-resume-details",isLoggedIn, deleteResumeDetails);
resumeDetialsRouter.get("/get-resume-details", isLoggedIn, getResumeDetails);

module.exports = resumeDetialsRouter;
