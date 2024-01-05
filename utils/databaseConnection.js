require("dotenv").config();
const mongoose = require("mongoose");
const DATABASE_URL = process.env.DATABASE_URL;

const connectDatabase = () => {
  mongoose
    .connect(DATABASE_URL)
    .then(() => {
      console.log("Connection with database successful");
    })
    .catch((err) => {
      console.log("Error connecting with database ", err);
    });
};

module.exports = connectDatabase;
