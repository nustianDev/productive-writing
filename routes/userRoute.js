const express = require("express");
const router = express.Router();

const { createNewUser } = require("../controllers/userController");

router.post("/createUser", createNewUser);

module.exports = router;
