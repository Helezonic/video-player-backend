const multer = require("multer")
const fs = require("fs")
const ApiError = require("../utils/apiError")


console.log("Start Multer Middleware")

//Store the file to localStorage, and a filename can be given.
const fileStorage = multer.diskStorage({
  destination : function (req,file,cb) {
    cb(null,'./public/temp')
  },
  filename : function (req, file, cb) {
    cb(null,file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  // Check the field name and validate the file type accordingly
  if (file.fieldname === "video") {
    const allowedVideoTypes = ["video/mp4", "video/mkv"];
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Invalid file type for video"), false);
    }
  } else {
    const allowedImageTypes = ["image/jpeg", "image/png"];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Invalid file type for thumbnail"), false);
    }
  }
};

console.log("End Multer Middleware")

exports.upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter
})