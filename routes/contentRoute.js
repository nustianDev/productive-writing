const express = require("express");
const router = express.Router();
const fs = require("fs");
const verify = require("../utils/JWTVerification");

const {
  createPageFolder,
  createTextFilesAndUpload,
} = require("../controllers/contentController");

router.get("/createPageFolder/:pagenumber", verify, createPageFolder);

router.post("/createTextFilesAndUpload", verify, createTextFilesAndUpload);

module.exports = router;
