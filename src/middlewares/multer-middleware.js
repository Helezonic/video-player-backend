const multer = require("multer")

console.log("Start Multer Middleware")

//Store the file to localStorage, and a filename can be given.
const fileStorage = multer.diskStorage({
  destination : function (req,file,cb) {
    cb(null,'../../public/temp')
  },
  filename : function (req, file, cb) {
    cb(null,file.originalname)
  }
})

console.log("End Multer Middleware")
exports.upload = multer({fileStorage})