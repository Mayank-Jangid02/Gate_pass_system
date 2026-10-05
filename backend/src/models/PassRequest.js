import mongoose from "mongoose";

const passRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: { type: String, required: true },
    leaveDate: { type: Date, required: true },
    expectedReturn: { type: Date },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedAt: { type: Date },
    approvedByName: { type: String },
    // Security verification tracking
    securityStatus: {
      type: String,
      enum: ["PENDING_EXIT", "CHECKED_OUT", "CHECKED_IN"],
      default: "PENDING_EXIT",
    },
    securityCheckedOutAt: { type: Date },
    securityCheckedInAt: { type: Date },
    securityNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

const PassRequest = mongoose.model("PassRequest", passRequestSchema);

export default PassRequest;

