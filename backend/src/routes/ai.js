import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/suggest-faculty",
  authRequired,
  requireRole("student"),
  async (req, res) => {
    try {
      const { leaveDate } = req.body;
      if (!leaveDate) {
        return res.status(400).json({ message: "Leave date is required" });
      }

      const student = await User.findById(req.user.id);
      if (!student || !student.department) {
        return res.status(400).json({ message: "Student department not found" });
      }

      // Find all faculty in the student's department
      const facultyList = await User.find({
        role: "faculty",
        department: student.department,
        isActive: true,
      });

      if (facultyList.length === 0) {
        return res.json({ suggestedFacultyIds: [] });
      }

      // Ensure API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing in .env");
        return res.status(500).json({ message: "AI service is not configured" });
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Construct prompt
      let prompt = `You are a helpful assistant for a gate pass system. A student wants to request a gate pass for the following time: ${new Date(leaveDate).toLocaleString()}.\n\n`;
      prompt += `I am providing you with the timetable documents for each faculty member in the student's department. Please read these documents to determine who is free.\n`;
      
      facultyList.forEach(f => {
        const timetableInfo = f.timetable ? f.timetable : "No timetable document provided, assume available.";
        prompt += `- Faculty ID: ${f._id.toString()}, Name: ${f.name}\n  Timetable Document: ${timetableInfo}\n`;
      });

      prompt += `\nBased on these timetable documents, identify ALL faculty members who are currently free (i.e., they do not have a lecture or other commitments at the requested time). There can be multiple faculty members who are free.
Please return ONLY a raw JSON array containing the IDs (as strings) of the available faculty. Do not use markdown blocks, just the JSON array. For example: ["65d1f8a8b1c4e2a3f01c8901", "65d1f8a8b1c4e2a3f01c8902"]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      let suggestedFacultyIds = [];
      try {
        // Attempt to parse JSON response. Strip backticks if present.
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestedFacultyIds = JSON.parse(cleanText);
      } catch (parseErr) {
        console.error("Failed to parse AI response", parseErr, "Raw text:", text);
        return res.status(500).json({ message: "Failed to parse AI suggestion" });
      }

      res.json({ suggestedFacultyIds });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get AI suggestion" });
    }
  }
);

export default router;
