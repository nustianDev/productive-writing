require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../ErrorHandling/Error");

const verify = (req, res, next) => {
  let recievedToken = req?.headers?.cookie;
  if (!recievedToken) {
    throw new CustomError(402, "You are not authorized");
  }
  recievedToken = recievedToken.split("=")[1];
  const data = jwt.verify(recievedToken, process.env.SECRET_KEY);
  req.userData = data;
  next();
};

module.exports = verify;
