const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    candidateId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: false },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Candidate", candidateSchema);

