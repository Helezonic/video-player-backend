const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/apiError.js")
const { User } = require("../models/user-model.js");
const uploadToCloudinary = require("../utils/cloudinary.js");
const ApiResponse = require("../utils/apiResponse.js");

console.log("Start of User Controller")
const registerUser = asyncHandler(
  async (req,res) => {
    console.log("Request Body\n", req.body)

    //Order of destructuring doesn't matter, only the spelling matters
    const {email, fullName, userName, password} = req.body //avatar and coverImage is received in req.files
    console.log("Destructured", "\nfullName : ", fullName, "\nemail: ", email, "\nuserName: ", userName, "\npassword: ", password)


    //To not throw error while submitting form to database, do the validation here
      //Is it empty? Any order of array is fine.
      if(
        [fullName, email, userName, password].some((field)=> field?.trim() === "")
      ) { throw new ApiError(400,"Empty fields") }


      //Prevent Duplication - Check whether received email or userName field values exists in the database
      const dbSearch = await User.findOne({
        $or: [{userName}, {email}]
      })
      if(dbSearch?.userName === userName || dbSearch?.email === email)
      {throw new ApiError(409, "Username or Email exists")}


      //Are files received? If received, there will be a path created on our server by multer middleware. Controller functions are after Multer Middleware - which stores in public/temp and assigns name as per config
      const avatarPath = req.files?.avatar[0]?.path
      const coverImagePath = req.files?.coverImage[0]?.path

      if(
        !(avatarPath)
      ) { throw new ApiError(408, "Avatar not uploaded")}

      if(
        !(coverImagePath)
      ) { throw new ApiError(408, "Cover Image not uploaded")}


      //If things are smooth as of now, then upload files to cloudinary, which requires local path of the files
      const avatarUploaded = await uploadToCloudinary(avatarPath)
      const coverImageUploaded = await uploadToCloudinary(coverImagePath)
      console.log("avatarURL", avatarUploaded)
      console.log("coverImageURL", coverImageUploaded)
      if(
        !(avatarUploaded)
      ) { throw new ApiError(400, "Avatar Upload Error, please upload avatar again")}

      if(
        !(coverImageUploaded)
      ) { throw new ApiError(407, "Cover Image Upload Error, please upload avatar again")}


    //Now upload file details to DB
    const fileUploaded = await User.create({
      userName,
      email,
      fullName,
      password, //password has not been hashed yet. It will be hashed only during db upload by the model instance method
      avatar : avatarUploaded,
      coverImage : coverImageUploaded
    })

    if (fileUploaded) 
      { console.log("Successful DB upload") }
    else 
      { throw new ApiError(500, "Database upload failed, retry")}
      

    //Get uploaded file details, remove password and Refresh Token, to be send as response.
    const fileDetailsRefined = await User.findById(fileUploaded._id).select("-password -refreshToken") 


    //Finish the HTTP request by responding
    res.status(201).json(
      new ApiResponse(201,fileDetailsRefined,"Successful Registration")
    )
  }
)

const logIn = "";

const logOut = "";

//When access Token expires
const accessRefreshToken = ""

const changeCurrentPassword = ""

const getCurrentUser = ""

const updateUserDetails = ""

const updateAvatar = ""

//Mongo aggregate
const getUserChannelProfile = ""

//Mongo subpipeline
const getWatchHistory = ""


console.log("End of User Controller")
module.exports = registerUser 
