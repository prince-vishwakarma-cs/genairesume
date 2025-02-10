import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: {
      phone: { type: String },
      location: { type: String },
    },
    summary: { type: String },
    urls: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],
    experience: [
      {
        organisation: { type: String },
        job_role: { type: String },
        description: [{ type: String }],
        from: { type: String },
        to: { type: String },
      },
    ],
    academics: [
      {
        institute: { type: String },
        degree: { type: String },
        achievements: [{ type: String }],
        from: { type: String },
        to: { type: String },
      },
    ],
    projects: [
      {
        title: { type: String },
        description:[{ type: String }] ,
        techstack: [{ type: String }],
        github: { type: String },
      },
    ],
    additional_info: {
      skills: [{ type: String }],
      certifications: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", ResumeSchema);
