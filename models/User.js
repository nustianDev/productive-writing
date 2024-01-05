const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "No duplicate email is allowed"],
  },
  isEmailVerified: {
    type: Boolean,
    required: [true, "Email verification info required"],
  },
  profilePicture: {
    type: String,
    default: "",
  },
  token: {
    type: Object,
    required: [true, "Must have a token"],
  },
  projects: {
    type: [],
    default: [],
  },
});

const User = model("user", userSchema);

module.exports = User;
