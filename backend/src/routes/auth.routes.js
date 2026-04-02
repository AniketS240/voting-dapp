const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { connectController } = require("../controllers/auth.controller");
const { isValidAddress } = require("../utils/validate");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/connect",
  [
    body("walletAddress")
      .isString()
      .bail()
      .custom((value) => isValidAddress(value)),
  ],
  validateRequest,
  asyncHandler(connectController)
);

module.exports = router;

