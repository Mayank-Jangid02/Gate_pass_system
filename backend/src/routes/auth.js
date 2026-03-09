import express from "express";
import User from "../models/User.js";
import { signToken } from "../middleware/auth.js";

const router = express.Router();

// Check if admin account exists (public, for signup page)
router.get("/admin-exists", async (req, res) => {
  try {
    const count = await User.countDocuments({ role: "admin" });
    res.json({ exists: count > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: true });
  }
});

// Student signup (email-based). Admin signup allowed only when no admin exists.
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      enrollmentNumber,
      profileImageUrl,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const signupRole = role === "admin" ? "admin" : "student";

    // For students, department and enrollment number are required
    if (signupRole === "student") {
      if (!department || !enrollmentNumber) {
        return res
          .status(400)
          .json({ message: "Department and enrollment number are required" });
      }
    }

    // Admin signup: only allow when no admin exists in the database
    if (signupRole === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount > 0) {
        return res.status(403).json({
          message: "Admin account already exists. Please use the Login page.",
        });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      role: signupRole,
      department: department || null,
      enrollmentNumber: enrollmentNumber || null,
      profileImageUrl: profileImageUrl || null,
    });
    await user.save();

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        enrollmentNumber: user.enrollmentNumber || null,
        profileImageUrl: user.profileImageUrl || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      const pretty =
        user.role === "student"
          ? "Student"
          : user.role === "faculty"
          ? "Faculty"
          : "Admin";
      return res.status(403).json({
        message: `This account is a ${pretty} account. Please use the ${pretty} login.`,
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        enrollmentNumber: user.enrollmentNumber || null,
        profileImageUrl: user.profileImageUrl || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;

