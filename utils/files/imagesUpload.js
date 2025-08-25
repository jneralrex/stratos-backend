// utils/imageUpload.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../../config/config");

const receiptImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "reciept-images",
    format: "webp",
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto:low" },
      { fetch_format: "webp" },
      { bytes_limit: 1024000 }
    ]
  }
});


const uploadRecieptImage = multer({ storage: receiptImageStorage });

module.exports = {
uploadRecieptImage, 
};
