require("dotenv").config();
const { google } = require("googleapis");
const CustomError = require("../ErrorHandling/Error");
const http = require("http");

exports.createNewUser = (req, res, next) => {
  console.log("UserController speaking", req.body);
  res.send({
    success: true,
    data: req.body,
  });
};
