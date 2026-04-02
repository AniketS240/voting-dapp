const express = require("express");
const { body, param } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { adminAuth } = require("../middleware/adminAuth");
const { validateRequest } = require("../middleware/validateRequest");
const {
  addWhitelistController,
  removeWhitelistController,
  getWhitelistController,
} = require("../controllers/whitelist.controller");
const { isValidAddress } = require("../utils/validate");

const router = express.Router();

router.post(
  "/add",
  adminAuth,
  [
    body("walletAddress").isString().bail().custom((v) => isValidAddress(v)),
  ],
  validateRequest,
  asyncHandler(addWhitelistController)
);

router.post(
  "/remove",
  adminAuth,
  [
    body("walletAddress").isString().bail().custom((v) => isValidAddress(v)),
  ],
  validateRequest,
  asyncHandler(removeWhitelistController)
);

router.get(
  "/:address",
  [
    param("address").isString().bail().custom((v) => isValidAddress(v)),
  ],
  validateRequest,
  asyncHandler(getWhitelistController)
);

module.exports = router;

