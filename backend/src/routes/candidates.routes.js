const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { getCandidatesController } = require("../controllers/candidates.controller");

const router = express.Router();

// GET /api/candidates
router.get("/", asyncHandler(getCandidatesController));

module.exports = router;

