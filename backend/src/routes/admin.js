import express from "express";
import User from "../models/User.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Admin: list faculty members
router.get(
  "/faculty",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const faculty = await User.find({ role: "faculty" }).select(
        "name email department enrollmentNumber profileImageUrl isActive createdAt"
      );
      res.json(faculty);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load faculty list" });
    }
  }
);

// Admin: create faculty member
router.post(
  "/faculty",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        department,
        enrollmentNumber,
        profileImageUrl,
      } = req.body;
      if (!name || !email || !password || !department) {
        return res
          .status(400)
          .json({ message: "Name, email, password and department are required" });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const faculty = new User({
        name,
        email,
        password,
        role: "faculty",
        department,
        enrollmentNumber: enrollmentNumber || null,
        profileImageUrl: profileImageUrl || null,
      });
      await faculty.save();

      res.status(201).json({
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department || null,
        enrollmentNumber: faculty.enrollmentNumber || null,
        profileImageUrl: faculty.profileImageUrl || null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create faculty" });
    }
  }
);

// Student: list faculty in the same department as the logged-in student
router.get(
  "/faculty/by-department",
  authRequired,
  requireRole("student"),
  async (req, res) => {
    try {
      const student = await User.findById(req.user.id);
      if (!student || !student.department) {
        return res
          .status(400)
          .json({ message: "Student department information is missing" });
      }

      const faculty = await User.find({
        role: "faculty",
        department: student.department,
        isActive: true,
      }).select("name email department profileImageUrl");

      res.json({
        department: student.department,
        faculty,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load department faculty" });
    }
  }
);

// Admin: remove (soft-delete) faculty
router.delete(
  "/faculty/:id",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const faculty = await User.findOne({
        _id: req.params.id,
        role: "faculty",
      });
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      faculty.isActive = false;
      await faculty.save();

      res.json({ message: "Faculty member deactivated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to remove faculty" });
    }
  }
);

export default router;

