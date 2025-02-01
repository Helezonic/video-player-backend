const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/apiError.js")
const { User } = require("../models/user-model.js");
const uploadToCloudinary = require("../utils/cloudinary.js");
const ApiResponse = require("../utils/apiResponse.js");

console.log("Start of User Controller")

//REGISTER USER----------------------
const registerUser = asyncHandler(
  async (req,res) => {
    console.log("Register User\n", req.body)

    //Order of destructuring doesn't matter, only the spelling matters
    const {email, fullName, userName, password} = req.body //avatar and coverImage is received in req.files
    console.log("Destructured", "\nfullName : ", fullName, "\nemail: ", email, "\nuserName: ", userName, "\npassword: ", password)


    //To not throw error while submitting form to database, do the validation here, as the database details are based on mongoose model.
      //Is it empty? Any order of array is fine.
      if(
        [fullName, email, userName, password].some((field)=> field?.trim() === "") //some method is for Array, and array is created here without any declaration step
      ) { throw new ApiError(400,"Empty fields") }


      //Prevent Duplication - Check whether received email or userName field values exists in the database
      const dbSearch = await User.findOne({
        $or: [{userName}, {email}]
      })
      if(dbSearch?.userName === userName || dbSearch?.email === email)
      {throw new ApiError(409, "Username or Email exists")}


      //Are files received? If received, there will be a path created on our server by multer middleware. Controller functions comes after Multer Middleware - which stores in public/temp and assigns name as per config
      const avatarPath = req.files?.avatar[0]?.path
      const coverImagePath = req.files?.coverImage[0]?.path

      if(
        !(avatarPath)
      ) { throw new ApiError(408, "Avatar not uploaded")}

      if(
        !(coverImagePath)
      ) { throw new ApiError(408, "Cover Image not uploaded")}


      //If things are smooth as of now, then upload files to cloudinary, which requires local path of the files
      const avatarUploaded = await uploadToCloudinary(avatarPath, "Avatar")
      const coverImageUploaded = await uploadToCloudinary(coverImagePath, "Cover Image")
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


const getCurrentUser = ""

//LOGIN PAGE-------------------
//Generate access token, refresh token and store in cookies
const logIn = asyncHandler(
  async (req,res) => {
    const {email, userName, password} = req.body
    console.log("Log In User\n", req.body)
    if(!req.body)
      throw new ApiError(400, "Request Body nothing recieved")

    //check whether fields are empty
    if( !email || !userName || !password)
      throw new ApiError(400, "Empty Fields")
    console.log("Destructured", "\nemail: ", email, "\nuserName: ", userName, "\npassword: ", password)


    //if not, search for them in the database
    const searchDB = await User.findOne(
      {
        $and : [{userName},{email}]
      }
    )
    console.log("searchDB", searchDB)
    if(!searchDB){
      throw new ApiError(400, "User doesn't exist")
    } 
    console.log("User found")

    //Compare the password with bcrypt compare
    const passCheck = await searchDB.isPasswordCorrect(password)
    if(!passCheck){
      throw new ApiError(400, "Password error")
    }
    console.log("Password Correct")

    //if all are good, create Access and Refresh tokens
    const accessToken = await searchDB.generateAccessToken()
    const refreshToken = await searchDB.generateRefreshToken()
    console.log("Access and Refresh Token Generated")

    //add & save Refresh Token in the queried document
    searchDB.refreshToken = refreshToken
    await searchDB.save({validateBeforeSave: false}) //so that the document as a whole is saved no validation.
    console.log("Refresh Token added and saved")

    //return found user as ApiResponse with no password but refreshToken, accessToken as cookie
    const dBSearchForResponse = await User.findById(searchDB._id).select("-password -refreshToken")
    const options = { //so that client can't edit or change the tokens
      httpOnly : true,
      secure : true 
    }
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200, {userData: dBSearchForResponse, accessToken, refreshToken}, "Successful Login"))

  }
);


//LOGOUT BUTTON--------------------
const logOut = asyncHandler(
  async (req,res) => {
    //userId of user through middleware
    const userId = req.userId
    console.log(userId)

    //delete refreshToken from db, returns old document from DB by default
    const loggedOutDB = await User.findByIdAndUpdate(userId, 
      {
        $set: {refreshToken: undefined}
      }, 
      {
        new : true //returning doc is updated one
      }
    )

    const options = { //so that client can't edit or change the tokens
      httpOnly : true,
      secure : true 
    }

    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{loggedOutDB}, "User Logged out"))

  }
);

//When Access Token expires, regenerate with Refresh Token
const accessRefreshToken = ""

//UPDATE USER SETTINGS - PASSWORD
const changeCurrentPassword = ""

//UPDATE USER SETTINGS
const updateUserDetails = ""

//UPDATE USER SETTINGS - IMAGE
const updateAvatar = ""

//Mongo aggregate
const getUserChannelProfile = ""

//Mongo subpipeline
const getWatchHistory = ""


console.log("End of User Controller")
module.exports = {registerUser, logIn, logOut} 
