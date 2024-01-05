const express = require("express");
const router = express.Router();
const verify = require("../utils/JWTVerification");

const {
  getAuthUrl,
  getToken,
  getUser,
} = require("../controllers/authController");

router.get("/getAuthURL", getAuthUrl);
router.get("/getToken", getToken);
router.get("/getUser", verify, getUser);

module.exports = router;
