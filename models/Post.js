const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const User = require("./User");

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    content: {
      type: String,
    },
    category: {
      type: String,
      default: null,
    },
    featuredImage: {
      type: String,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    reads: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = model("post", postSchema);
module.exports = Post;
