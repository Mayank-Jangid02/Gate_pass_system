import express from "express";
import User from "../models/User.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Faculty: Update their own timetable
router.put(
  "/timetable",
  authRequired,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const { timetable } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      user.timetable = timetable;
      await user.save();

      res.json({ message: "Timetable updated successfully", timetable: user.timetable });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update timetable" });
    }
  }
);

// Faculty: Get their own timetable
router.get(
  "/timetable",
  authRequired,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.json({ timetable: user.timetable || "" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch timetable" });
    }
  }
);

export default router;
