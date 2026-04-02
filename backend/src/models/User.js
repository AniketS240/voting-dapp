const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isWhitelisted: { type: Boolean, required: true, default: false },
    hasVoted: { type: Boolean, required: true, default: false },
    role: { type: String, default: "user", enum: ["admin", "user"] },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("User", userSchema);

