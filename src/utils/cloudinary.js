const { v2 } = require("cloudinary");
const fs = require("fs")

v2.config({ 
  cloud_name: process.env.CLOUDINARY_URI, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null;

    const uploadResult = await v2.uploader.upload(`${localFilePath}`,{
      resource_type : "auto"
    })

    /* fs.unlinkSync(localFilePath) */ //Delete localFile even if cloud upload is success or fail

    if (uploadResult){
      console.log("file has been uploaded successfully")
      return uploadResult.url
    }
    
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Upload to cloudinary failed!", error)
    return null;
  }
}

module.exports= uploadToCloudinary