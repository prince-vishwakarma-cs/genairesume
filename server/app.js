import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middleware/error.js";
import resumeRouter from "./routes/resume.js"
import aiRouter from "./routes/ai.js"
import cors from "cors"

const app = express();

dotenv.config({ path: ".env" });

const mongo_uri = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());
connectDB(mongo_uri);

app.use("/api/resume/",resumeRouter)
app.use("/api/ai/", aiRouter)

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server is working",
  });
});

app.use(errorMiddleware);
app.listen(4000, () => {
  console.log("Server is working");
});
