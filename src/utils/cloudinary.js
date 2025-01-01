const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadToCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null;
    console.log("File path received in cloudinary: ",localFilePath)

    const uploadResult = await cloudinary.uploader.upload(localFilePath,{
      resource_type : "auto"
    })

    if (uploadResult){
      console.log("Upload to cloudinary successfull!")
      return uploadResult.url
    }
    
  } catch (error) {
    console.log("Upload to cloudinary failed!", error)
    return null;

  } finally {
    fs.unlinkSync(localFilePath) //Successful or failure, delete the file from local server
  }
}

module.exports= uploadToCloudinary