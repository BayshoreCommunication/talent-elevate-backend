const ResumeDetails = require("../models/resumeDetailsModel");
const createError = require("http-errors");
const mongoose = require("mongoose");

// Create Resume Details
const createResumeDetails = async (req, res, next) => {
  try {
    const resume = await ResumeDetails.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({
      statusCode: 201,
      message: "Resume details created successfully",
      payload: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// Update Resume Details
const updateResumeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedResume = await ResumeDetails.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedResume) {
      throw createError(404, "Resume details not found");
    }
    res.status(200).json({
      statusCode: 200,
      message: "Resume details updated successfully",
      payload: { resume: updatedResume },
    });
  } catch (error) {
    next(error);
  }
};

// Delete Resume Details
const deleteResumeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedResume = await ResumeDetails.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!deletedResume) {
      throw createError(404, "Resume details not found");
    }
    res.status(200).json({
      statusCode: 200,
      message: "Resume details deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get Resume Details (for the logged-in user)
const getResumeDetails = async (req, res, next) => {
  try {
    const resume = await ResumeDetails.findOne({
      userId: req.user._id,
    });
    if (!resume) {
      throw createError(404, "Resume details not found");
    }
    res.status(200).json({
      statusCode: 200,
      message: "Resume details fetched successfully",
      payload: { resume },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResumeDetails,
  updateResumeDetails,
  deleteResumeDetails,
  getResumeDetails,
};
