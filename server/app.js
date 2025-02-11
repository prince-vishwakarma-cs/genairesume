import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middleware/error.js";
import resumeRouter from "./routes/resume.js";
import aiRouter from "./routes/ai.js";
import cors from "cors";

dotenv.config({ path: ".env" });

const app = express();
const mongo_uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Allow only the frontend URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with actual frontend URL
  credentials: true, // Allows cookies and authentication headers
};

app.use(express.json());
app.use(cors(corsOptions));
connectDB(mongo_uri);

app.use("/api/resume/", resumeRouter);
app.use("/api/ai/", aiRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is working",
  });
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
