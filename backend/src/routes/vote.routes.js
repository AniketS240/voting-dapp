const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { validateRequest } = require("../middleware/validateRequest");
const { validateVoteController } = require("../controllers/vote.controller");
const { isValidAddress, parseCandidateId } = require("../utils/validate");

const router = express.Router();

router.post(
  "/validate",
  [
    body("walletAddress").isString().bail().custom((v) => isValidAddress(v)),
    body("candidateId")
      .custom((v) => parseCandidateId(v) !== null)
      .withMessage("candidateId must be a positive integer"),
  ],
  validateRequest,
  asyncHandler(validateVoteController)
);

module.exports = router;

