import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./src/routes/auth.js";
import passRoutes from "./src/routes/pass.js";
import adminRoutes from "./src/routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gatepass";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Gate Pass API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });

