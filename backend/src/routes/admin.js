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

// Admin: get active security account details
router.get(
  "/security",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const securityUser = await User.findOne({ role: "security", isActive: true }).select(
        "name email role isActive createdAt"
      );
      res.json({ security: securityUser || null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load security user" });
    }
  }
);

// Admin: create security account (only 1 active security account allowed)
router.post(
  "/security",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Name, email, and password are required" });
      }

      // Enforce single active security account rule
      const existingSecurity = await User.findOne({
        role: "security",
        isActive: true,
      });
      if (existingSecurity) {
        return res.status(403).json({
          message:
            "A Security account already exists. Only one Security account is allowed at a time.",
        });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const securityUser = new User({
        name,
        email,
        password,
        role: "security",
      });
      await securityUser.save();

      res.status(201).json({
        id: securityUser._id,
        name: securityUser.name,
        email: securityUser.email,
        role: securityUser.role,
        isActive: securityUser.isActive,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create security account" });
    }
  }
);

// Admin: remove/deactivate security account
router.delete(
  "/security/:id",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const securityUser = await User.findOne({
        _id: req.params.id,
        role: "security",
      });
      if (!securityUser) {
        return res.status(404).json({ message: "Security account not found" });
      }

      securityUser.isActive = false;
      await securityUser.save();

      res.json({ message: "Security account deactivated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to remove security account" });
    }
  }
);

export default router;

