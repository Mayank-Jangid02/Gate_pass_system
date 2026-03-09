import express from "express";
import PassRequest from "../models/PassRequest.js";
import User from "../models/User.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Student: create pass request
router.post(
  "/",
  authRequired,
  requireRole("student"),
  async (req, res) => {
    try {
      const { reason, leaveDate, requestedFaculty } = req.body;
      if (!reason || !leaveDate) {
        return res
          .status(400)
          .json({ message: "Reason and leave date are required" });
      }
      if (!requestedFaculty) {
        return res
          .status(400)
          .json({ message: "Please select a faculty from your department" });
      }

      const student = await User.findById(req.user.id);
      const faculty = await User.findOne({
        _id: requestedFaculty,
        role: "faculty",
        isActive: true,
      });
      if (!faculty) {
        return res.status(400).json({ message: "Invalid faculty selected" });
      }
      if (student.department !== faculty.department) {
        return res
          .status(403)
          .json({ message: "Faculty must be from your department" });
      }

      const pass = await PassRequest.create({
        student: req.user.id,
        reason,
        leaveDate,
        requestedFaculty: faculty._id,
      });

      res.status(201).json(pass);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Could not create pass request" });
    }
  }
);

// Student: view own passes
router.get(
  "/my",
  authRequired,
  requireRole("student"),
  async (req, res) => {
    try {
      const passes = await PassRequest.find({ student: req.user.id })
        .populate("faculty", "name email")
        .populate("requestedFaculty", "name email")
        .sort({ createdAt: -1 });
      res.json(passes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load passes" });
    }
  }
);

// Faculty: list pending passes (only those requested for this faculty)
router.get(
  "/pending",
  authRequired,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const passes = await PassRequest.find({
        status: "PENDING",
        $or: [
          { requestedFaculty: req.user.id },
          { requestedFaculty: { $exists: false } },
          { requestedFaculty: null },
        ],
      })
        .populate("student", "name email enrollmentNumber")
        .sort({ createdAt: 1 });
      res.json(passes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load pending passes" });
    }
  }
);

// Faculty: view approval history
router.get(
  "/history",
  authRequired,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const passes = await PassRequest.find({
        faculty: req.user.id,
        status: "APPROVED",
      })
        .populate("student", "name email enrollmentNumber")
        .sort({ approvedAt: -1 });
      res.json(passes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load approval history" });
    }
  }
);

// Faculty: approve / reject
router.patch(
  "/:id/decision",
  authRequired,
  requireRole("faculty"),
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const pass = await PassRequest.findById(req.params.id);
      if (!pass) {
        return res.status(404).json({ message: "Pass not found" });
      }

      pass.status = status;
      if (status === "APPROVED") {
        pass.faculty = req.user.id;
        pass.approvedAt = new Date();
        pass.approvedByName = req.user.name;
      }

      await pass.save();
      const populated = await pass.populate([
        { path: "student", select: "name email" },
        { path: "faculty", select: "name email" },
      ]);

      res.json(populated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Could not update pass" });
    }
  }
);

// Any authenticated user: view pass for printing (but we mainly use for student)
router.get("/:id", authRequired, async (req, res) => {
  try {
    const pass = await PassRequest.findById(req.params.id)
      .populate("student", "name email enrollmentNumber")
      .populate("faculty", "name email")
      .populate("requestedFaculty", "name email");
    if (!pass) {
      return res.status(404).json({ message: "Pass not found" });
    }
    res.json(pass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load pass" });
  }
});

export default router;

