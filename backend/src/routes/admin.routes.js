const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../middleware/asyncHandler");
const { adminAuth } = require("../middleware/adminAuth");
const { validateRequest } = require("../middleware/validateRequest");
const { adminAddCandidateController, adminStartElectionController, adminEndElectionController } =
  require("../controllers/admin.controller");
const { sanitizeString } = require("../utils/validate");

const router = express.Router();

router.post(
  "/add-candidate",
  adminAuth,
  [
    body("name")
      .isString()
      .bail()
      .custom((v) => sanitizeString(v, { min: 1, max: 100 }) !== null),
    body("description")
      .optional()
      .isString()
      .bail()
      .custom((v) => sanitizeString(v, { min: 0, max: 500 }) !== null),
    body("imageUrl")
      .optional()
      .isString()
      .bail()
      .custom((v) => sanitizeString(v, { min: 0, max: 5000 }) !== null),
  ],
  validateRequest,
  asyncHandler(adminAddCandidateController)
);

router.post(
  "/start-election",
  adminAuth,
  asyncHandler(adminStartElectionController)
);

router.post(
  "/end-election",
  adminAuth,
  asyncHandler(adminEndElectionController)
);

module.exports = router;

