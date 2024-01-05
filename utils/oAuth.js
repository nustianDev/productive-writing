require("dotenv").config();
const { google } = require("googleapis");

//OAuth
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uris = process.env.REDIRECT_URIS;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris
);

//Scope
const SCOPE = [
  "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file",
];

module.exports = { oAuth2Client, SCOPE };
