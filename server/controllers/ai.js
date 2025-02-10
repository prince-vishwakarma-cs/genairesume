import axios from "axios";
import { TryCatch } from "../middleware/error.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const apiKey = process.env.GEMINI_API_KEY;

export const fetchOptimizedResponse = TryCatch(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title ){
    return res.status(400).json({ message: "Please fill title" });
  }else if(!description){
    return res.status(400).json({ message: "Please fill description" });
  }else if(!category){
    return res.status(400).json({ message: "Please fill category" });
  }

  const prompt = `
Optimize the following ${category} entry for an ATS-friendly resume:

**Title:** ${title}
**Description:** ${description}

Guidelines:
- Use concise, action-oriented bullet points.
- Prioritize achievements and impact.
- Avoid unnecessary words, keeping it ATS-friendly.
- Format output as plain text one sentence (no bullet points or HTML or markdown).
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    }
  );

  const responseText =
    response.data.candidates[0]?.content?.parts[0]?.text || "No response";

  return res.status(200).json({ success: true, message: responseText });
});