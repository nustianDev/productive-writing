require("dotenv").config();
const { google } = require("googleapis");
const CustomError = require("../ErrorHandling/Error");
const jwt = require("jsonwebtoken");
const { oAuth2Client, SCOPE } = require("../utils/oAuth.js");
const _ = require("lodash");

const User = require("../models/User");

//Request Controllers----------------------------------------------------------
exports.getAuthUrl = async (req, res, next) => {
  try {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPE,
    });
    return res.send({
      success: true,
      url: authUrl,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getToken = async (req, res, next) => {
  try {
    let receivedCode = req?.query?.code;

    if (!receivedCode) {
      throw new CustomError(402, "You are not authorized");
    }

    oAuth2Client.getToken(receivedCode, async (err, token) => {
      if (err) {
        console.error("Error retrieving access token", err);
        throw new CustomError(400, "Error retrieving access token");
      }

      oAuth2Client.setCredentials(token);
      const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });

      try {
        const response = await new Promise((resolve, reject) => {
          oauth2.userinfo.get((err, response) => {
            if (err) {
              reject(new CustomError(500, "Error retrieving user info"));
            }
            resolve(response);
          });
        });

        const userData = response.data;
        const { email, name, picture, verified_email } = userData;

        const user = await User.findOne({ email: email });

        if (user) {
          throw new CustomError(402, "Duplicate email");
        } else {
          const newUser = new User({
            fullname: name,
            email: email,
            isEmailVerified: verified_email,
            profilePicture: picture || "",
            token: token,
          });

          await newUser.save();

          // Sign the token using JWT
          const jwtToken = jwt.sign(
            { userId: newUser._id, token: token },
            process.env.SECRET_KEY
          );

          // Set the JWT token as a cookie
          res.cookie("access_token", jwtToken);
          const baseUrl = process.env.BASE_URL || "http://localhost:5173"; // Default to local URL

          const redirectUrl = `${baseUrl}/write`;
          res.redirect(redirectUrl);
        }
      } catch (err) {
        throw new CustomError(500, "Error processing user data");
      }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const { userId, token } = req.userData;

    // Find the user in the database
    const user = await User.findOne({ _id: userId });
    console.log("DToken", user.token);
    console.log("CToken", token);
    if (!user || !_.isEqual(user.token, token)) {
      throw new CustomError(402, "Incorrect details");
    }

    // Generate a new JWT token
    const newJwtToken = jwt.sign(
      { userId: userId, token: token },
      process.env.SECRET_KEY
    );

    // Set the new token as a cookie
    res.cookie("access_token", newJwtToken, {
      httpOnly: true,
      // Other cookie options like secure: true if your site is served over HTTPS
    });

    return res.json({
      success: true,
      message: "User cookie created and sent successfully",
      user: user,
    });
  } catch (error) {
    return next(error);
  }
};
