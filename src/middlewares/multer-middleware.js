const multer = require("multer")

//Store the file to localPath
const fileStorage = multer.diskStorage({
  destination : function (req,file,cb) {
    cb(null,'../../public/temp')
  },
  filename : function (req, file, cb) {
    cb(null,file.fieldname)
  }
})

module.exports = fileStorage;