const { Schema, model } = require("mongoose");

const resumeDetailsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Add this if referencing User model
      required: true,
    },
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (value) {
          return /^[0-9]+$/.test(value);
        },
        message: "Phone number should only contain digits",
      },
    },
    currentCity: { type: String, trim: true },
    gender: { type: String, trim: true },
    languages:  {
      type: [String], 
      default: [],
    },
    type: { type: String, trim: true },
    course:  {
      type: [String], 
      default: [],
    },
    collegeName: { type: String, trim: true },
    duration: {
      startYear: { type: String, trim: true },
      endYear: { type: String, trim: true },
    },
    careerGoals: { type: String, trim: true },
    skills:  {
      type: [String], 
      default: [],
    },
    certifications: {
      type: [String], 
      default: [],
    },
    trainingProgram: { type: String, trim: true },
    organization: { type: String, trim: true },
    location: { type: String, trim: true },
    jobDuration: {
      startYear: { type: String, trim: true },
      endYear: { type: String, trim: true },
    },
    description: { type: String, trim: true },
    preferredIndustriesAndRoles: [{ type: String, trim: true, default: "" }],
  },
  { timestamps: true }
);

const ResumeDetails = model("ResumeDetails", resumeDetailsSchema);

module.exports = ResumeDetails;
