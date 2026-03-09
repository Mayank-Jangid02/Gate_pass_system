import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import PassRequest from "../src/models/PassRequest.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gatepass";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const studentResult = await User.deleteMany({ role: "student" });
    const facultyResult = await User.deleteMany({ role: "faculty" });

    console.log(`Deleted ${studentResult.deletedCount} student(s)`);
    console.log(`Deleted ${facultyResult.deletedCount} faculty member(s)`);

    const passResult = await PassRequest.deleteMany({});
    console.log(`Deleted ${passResult.deletedCount} pass request(s)`);

    console.log("Done.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
