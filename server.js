require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

//Custom imports
const connectDatabase = require("./utils/databaseConnection");

const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const contentRoutes = require("./routes/contentRoute");

//Database Connection
connectDatabase();

//body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cors
app.use(
  cors({
    origin: "*",
    methods: "GET, POST, PUT,PATCH, DELETE",
    credentials: true,
  })
);

//Route assignment
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/content", contentRoutes);

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

app.use((err, req, res, next) => {
  const code = err.status;
  return res.status(code || 500).json({
    message: err.message || "Something went wrong",
    success: false,
    status: 500,
  });
});

const PORT = process.env.PORT;

mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});

mongoose.connection.on("error", () => {
  console.log(
    "Probably due to connection with the database server, Server closed"
  );
  process.exit(1);
});
