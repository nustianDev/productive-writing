require("dotenv").config();
const { google } = require("googleapis");
const CustomError = require("../ErrorHandling/Error");
const fs = require("fs");
const { oAuth2Client } = require("../utils/oAuth.js");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

//Create Page Folder on drive for new page
exports.createPageFolder = async (req, res, next) => {
  const { token } = req.userData;
  try {
    const { pagenumber } = req.params;

    if (!pagenumber) {
      throw new CustomError(
        400,
        "Invalid Request - ID or Page Number not found"
      );
    }

    // Set up Google Drive API
    oAuth2Client.setCredentials(token);
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    // Ensure the "ProductiveWriting" folder exists and get its ID
    const productiveWritingFolderId = await ensureFolderExists(drive);

    // Check if the folder for the page number exists
    const pageFolderId = await getPageFolderId(
      drive,
      productiveWritingFolderId,
      pagenumber
    );

    if (!pageFolderId) {
      // Folder for the page number doesn't exist, create it
      const folderMetadata = {
        name: `Page_${pagenumber}`,
        mimeType: "application/vnd.google-apps.folder",
        parents: [productiveWritingFolderId],
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      console.log(
        `Folder for Page ${pagenumber} created successfully: ${folder.data.id}`
      );
      res.status(200).json({
        message: "Folder created successfully",
        success: true,
        folderId: folder.data.id,
      });
    } else {
      // Folder for the page number already exists
      console.log(
        `Folder for Page ${pagenumber} already exists: ${pageFolderId}`
      );
      res.status(200).json({
        message: "Folder already exists",
        success: true,
        folderId: pageFolderId,
      });
    }
  } catch (error) {
    return next(error);
  }
};

//create Text Files And Upload to drive
exports.createTextFilesAndUpload = async (req, res, next) => {
  const { token } = req.userData;
  try {
    const { updatedDataFormat } = req.body;
    const { max, pagenum, text } = updatedDataFormat;

    const result = await s3
      .putObject({
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: `page._${pagenum}_v${max}.txt`,
        Body: text,
      })
      .promise();

    console.log("S3 data: ", result);


    // Create a text file
    const fileName = `page_${pagenum}_v${max}.txt`;
    fs.writeFileSync(fileName, text, "utf-8");
    console.log(`File ${fileName} created successfully.`);

    // Upload the text file to Google Drive
    await uploadTextFileToDrive(fileName, pagenum, token);

    return res.status(200).json({
      success: true,
      message: "File created and uploaded successfully.",
    });
  } catch (error) {
    console.error("Error creating and uploading text file:", error);
    return next(error);
  }
};

//Helpers--------------------------------------------------------------

async function uploadTextFileToDrive(fileName, pagenum, token) {
  oAuth2Client.setCredentials(token);

  const drive = google.drive({ version: "v3", auth: oAuth2Client });

  // Ensure the "ProductiveWriting" folder exists and get its ID
  const productiveWritingFolderId = await ensureFolderExists(drive);

  const pageFolderId = await getPageFolderId(
    drive,
    productiveWritingFolderId,
    pagenum
  );

  if (!pageFolderId) {
    throw new CustomError(404, `Folder for Page ${pagenum} not found`);
  }

  const fileMetadata = {
    name: fileName,
    parents: [pageFolderId], // Specify the folder ID as the parent
  };

  const media = {
    mimeType: "text/plain",
    body: fs.createReadStream(fileName),
  };

  // Upload the text file
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id",
    },
    (err, file) => {
      oAuth2Client.setCredentials(null);

      if (err) {
        console.error("Error uploading text file:", err);
        throw new CustomError(500, `Error uploading text file`);
      }

      console.log(`Text file uploaded successfully: ${file.data.id}`);
      // Delete the local text file after upload
      fs.unlinkSync(fileName);
    }
  );
}

async function ensureFolderExists(drive) {
  try {
    // Check if the "ProductiveWriting" folder exists
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and name='ProductiveWriting'",
      fields: "files(id)",
    });

    if (response.data.files.length === 1) {
      // "ProductiveWriting" folder exists, return its ID
      return response.data.files[0].id;
    } else {
      // "ProductiveWriting" folder doesn't exist, create it
      const folderMetadata = {
        name: "ProductiveWriting",
        mimeType: "application/vnd.google-apps.folder",
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      console.log("ProductiveWriting folder created successfully");
      return folder.data.id;
    }
  } catch (error) {
    console.error("Error ensuring folder exists:", error);
    throw error;
  }
}

async function getPageFolderId(drive, parentFolderId, pagenum) {
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='Page_${pagenum}' and '${parentFolderId}' in parents`,
      fields: "files(id)",
    });

    if (response.data.files.length === 1) {
      return response.data.files[0].id;
    }

    return null;
  } catch (error) {
    console.error("Error getting page folder ID:", error);
    throw error;
  }
}
