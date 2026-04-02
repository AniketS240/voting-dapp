const mongoose = require("mongoose");

const electionStateSchema = new mongoose.Schema(
  {
    electionActive: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// Keep a single document (latest known state)
electionStateSchema.index({}, { unique: false });

module.exports = mongoose.model("ElectionState", electionStateSchema);

