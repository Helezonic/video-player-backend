const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/apiError.js")
const { User } = require("../models/user-model.js");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary.js");
const ApiResponse = require("../utils/apiResponse.js");
const jwt  = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

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
        [fullName, email, userName, password].some((field)=> !field) //some method is for Array, and array is created here without any declaration step
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
    const fileDetailsRefined = await User.findById(fileUploaded._id).select("-password -refreshToken -watchHistory -__v") 


    //Finish the HTTP request by responding
    res.status(201).json(
      new ApiResponse(201,fileDetailsRefined,"Successful Registration")
    )
  }
)


//LOGIN PAGE---------| ALL ERROR CASES CHECKED THROUGH POSTMAN
//Generate access token, refresh token and store in cookies
const logIn = asyncHandler(
  async (req,res) => {
    console.log("--------------LOGIN------------")
    const {email, userName, password} = req.body
    console.log("Log In User\n", req.body)
    if(!req.body)
      throw new ApiError(400, "Request Body nothing recieved")

    //check whether fields are empty
    if( !(email && userName && password))
      throw new ApiError(400, "Empty Fields")
    console.log("--Destructured", "\nemail: ", email, "\nuserName: ", userName, "\npassword: ", password)


    //if not, search for them in the database
    const searchDB = await User.findOne(
      {
        $and : [{userName},{email}]
      }
    ).select('-__v')
    console.log("--DB Found", searchDB)

    if(!searchDB){
      throw new ApiError(400, "User doesn't exist")
    } 
    console.log("--User found")

    //Compare the password with bcrypt compare
    const passCheck = await searchDB.isPasswordCorrect(password)
    if(!passCheck){
      throw new ApiError(400, "Password error")
    }
    console.log("--Password Correct")

    //if all are good, create Access and Refresh tokens
    const accessToken = await searchDB.generateAccessToken()
    const refreshToken = await searchDB.generateRefreshToken()
    console.log("--Access and Refresh Token Generated")

    //add & save Refresh Token in the queried document
    searchDB.refreshToken = refreshToken
    await searchDB.save({validateBeforeSave: false}) //so that the document as a whole is saved no validation.
    console.log("--Refresh Token added and saved in DB")

    //return found user as ApiResponse with no password but refreshToken, accessToken as cookie
    const dBSearchForResponse = await User.findById(searchDB._id).select("-password -refreshToken -__v")
    const options = { //credentials behaviour
      httpOnly : true,
      secure : true, //if env is development, secure is false
      sameSite : "None",
      
    }

    console.log("-Options", options)

    
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200, {userData: dBSearchForResponse, accessToken, refreshToken}, "Successful Login"))

    console.log("-------LOGIN DONE-----------")
  }
);


//LOGOUT BUTTON----------------| ALL ERROR CASES CHECKED THROUGH POSTMAN
const logOut = asyncHandler(
  async (req,res) => {
    console.log("--------------LOGOUT------------")
    //userId of user through middleware
    const userId = req.userId
    console.log("-",userId)

    //delete refreshToken from db, returns old document from DB by default
    const loggedOutDB = await User.findByIdAndUpdate(userId, 
      {
        $set: {refreshToken: ""}
      }, 
      {
        new : true //returning doc is updated one
      }
    ).select("-password")

    const options = { //credentials settings
      httpOnly : true,
      secure : process.env.NODE_ENV === "production",
      sameSite : "None"
    }
    
    console.log("-Options", options)
    res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{loggedOutDB}, "User Logged out"))

    console.log("-------LOGOUT DONE-----------")
  }
);

//When Access Token expires, regenerate with Refresh Token
const regenerateAccessToken = asyncHandler(
  async (req,res) => {

    console.log("--------------ACCESSTOKEN REGEN------------")
    //Collect refreshToken from cookies
    const refreshToken = req.cookies?.refreshToken

    if(!refreshToken)
      throw new ApiError(401, "No refreshToken, session is expired")

    try {
      //Decode it, get id, search by ID, check match
      const decodedToken = await jwt.verify(refreshToken,process.env.REFRESH_TOKEN_KEY)
      if(!decodedToken)
        throw new ApiError(401,"Token decoding error, check refresh Token")
  
      const searchDB = await User.findById(decodedToken?._id)
      if(!searchDB)
        throw new ApiError(401, "User not found in DB")
  
  
      if(searchDB.refreshToken!==refreshToken)
        throw new ApiError(401, "Unauthorised access")
  
      //Generate new access token and send response
      const accessToken = await searchDB.generateAccessToken()
  
      const options = { //so that client can't edit or change the tokens
        httpOnly : true,
        secure : true,
        sameSite : "None",
        
      }

      //Or should you regenerate both access and refresh token?
      res.status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, {}, "Access Token Regenerated"))
    } catch (error) {
      throw new ApiError(401, error.message || "Token decoding error")
    }
  }
)

//Respond with Current User Details | ALL ERROR CASES CHECKED THROUGH POSTMAN
const getCurrentUser = asyncHandler(
  async (req, res) => {
    console.log("---------GET USER----------")
    const user = await User.findById(req.userId).select("-password -refreshToken")
    
    if(!user)
      throw new ApiError(400, "User not found")
    console.log("User found")

    res.status(200)
    .json(new ApiResponse(200, {user}, "User found"))
  }
)

//UPDATE USER SETTINGS - PASSWORD | ALL ERROR CASES CHECKED THROUGH POSTMAN
const changeCurrentPassword = asyncHandler(
  async (req, res) => {
    console.log("-------------PASS UPDATE------------")
    const {oldPassword, newPassword} = req.body

    //Are fields empty?
    if(!(oldPassword && newPassword))
      throw new ApiError(400, "Fields are empty")


    //Are fields same?
    if(oldPassword === newPassword)
      throw new ApiError(400, "New Password same as Old Password")

    //Get user id from access token - middleware
    const userId = req.userId

    //should redirect to generating new access Id
    if(!userId)
      throw new ApiError(400,"Access id unavailable") //THIS ERROR WONT BE SHOWN AS THIS WILL BE CAUGHT BY MIDDLEWARE
    
    //Search for user on db
    const searchDb = await User.findById(userId)
    if(!searchDb)
      throw new ApiError(400, "User doesn't exist") //THIS ERROR WONT BE SHOWN AS THIS WILL BE CAUGHT BY MIDDLEWARE

    //verify older password
    const passCheck = await searchDb.isPasswordCorrect(oldPassword)
    if(!passCheck){
      throw new ApiError(400, "Password error")
    }
    console.log("Password Correct")

    //update newer password and save
    searchDb.password = newPassword
    const newPassSave = await searchDb.save({validateBeforeSave: false}) //initiates pre hook for password field

    console.log("Password Updated", newPassSave)

    
    res.status(200)
    .json(new ApiResponse(200, {}, "Password Successfully Updated"))
  }
)

//UPDATE USER SETTINGS | ALL ERROR CASES CHECKED THROUGH POSTMAN
const updateUserDetails = asyncHandler(
  async (req,res) => {
    console.log("-------------USER UPDATE------------")
    console.log("Update User Details")
    const {fullName} = req.body
    console.log("fullName - ", fullName)

    if(!fullName)
      throw new ApiError(400, "Field Blank")

    //Find in DB and update
    const updatedUser = await User.findByIdAndUpdate(req.userId,
      {
        $set: {fullName: fullName}
      },
      {
        new: true
      }
    ).select("-password -refreshToken")
    
    if(!updatedUser)
      throw new ApiError(400, "Update Error")

    res.status(200)
    .json(new ApiResponse(200,{updatedUser},"Successful Update"))
  }
)

//UPDATE USER SETTINGS - IMAGE | ALL ERROR CASES CHECKED THROUGH POSTMAN
const updateImages = asyncHandler(
  async (req,res) => {
    console.log("-------------IMAGE UPDATE------------")


    //After verifying user with JWT, get file URLs for default value
    const user = await User.findById(req.userId)

    console.log("Existing avatar URL" , user.avatar)
    console.log("Existing cover Image URL", user.coverImage)
    let avatarUploaded = user.avatar
    let coverImageUploaded = user.coverImage

    //After uploading through multer middleware
    console.log("Req Files - ",req.files)
    
    // If only avatar is updated and no coverImage
    if(req.files?.avatar){
      const avatarPath = req.files?.avatar[0]?.path

      const avatarUpdated = await uploadToCloudinary(avatarPath, "Avatar")
      console.log("avatarURL", avatarUpdated)

      if(
        !(avatarUpdated)
      ) { throw new ApiError(400, "Avatar Upload Error, please upload avatar again")}

      //Delete older file - Get public ID from URL by spliting the last part
      const parts = avatarUploaded.split('/')
      const lastPart = parts[parts.length - 1].split('.')
      const imagePublicId = lastPart[0]
      await deleteFromCloudinary(imagePublicId)
      
      avatarUploaded = avatarUpdated;
    } 


    // If only coverImage is updated and no avatar
    if(req.files?.coverImage) {
      const coverImagePath = req.files?.coverImage[0]?.path

      const coverImageUpdated = await uploadToCloudinary(coverImagePath, "Cover Image")
      console.log("coverImageURL", coverImageUpdated)

      if(
        !(coverImageUpdated)
      ) { throw new ApiError(407, "Cover Image Upload Error, please upload avatar again")}

      //Delete older file - Get public ID from URL by spliting the last part
      const parts = coverImageUploaded.split('/')
      const lastPart = parts[parts.length - 1].split('.')
      const imagePublicId = lastPart[0]
      await deleteFromCloudinary(imagePublicId)

      coverImageUploaded = coverImageUpdated
    } 
    

    //Find and update URL in the DB
    const updatedUser = await User.findByIdAndUpdate(req.userId,
      {
        $set: {
          avatar : avatarUploaded,
          coverImage : coverImageUploaded
        }
      },
      {
        new: true
      }
    ).select("-password -refreshToken")
    
    if(!updatedUser)
      throw new ApiError(400, "Update Error")

    console.log("Data updated")

    res.status(200)
    .json(new ApiResponse(200, {updatedUser}, "Images Successfully Updated"))
  }
)

//Mongo aggregate
//To get other user's channel details with subscriptions, 
const getUserChannelProfile = asyncHandler (
  async (req,res) => {
    const userId = req.userId
    const id = req.params?.id
    if(!id){
      throw new ApiError(404,"No id")
    }
    console.log("Logged in User", userId)
    console.log("Current User Id", id)

    const aggregate = await User.aggregate([
      {
        $match : {
          _id : new mongoose.Types.ObjectId(userId)
        }
      },
      //Get list of documents of users who has subscribed to you(logged in channel)
      {
        $lookup: {
          from : "subscriptions",
          localField : "_id",
          foreignField : "channel",
          as : "subscribers"
        }
      },
      //Get list of documents of users who you have subscribed to.
      {
        $lookup: {
          from : "subscriptions",
          localField : "_id",
          foreignField : "subscriber",
          as : "subscribedTo"
        }
      },
      {
        $addFields : {
          //Count number of subscribers
          subscriberCount : {
            $size : "subscribers"
          },
          //Count number of channels you have subscribed to
          channelsSubscribedToCount : {
            $size : "subscribedTo"
          },
          //Is the logged in channel subscribed to the current channel?
          isSubscribed : {
            $cond : {
              //From the list of subscribers added above, is there your channel id on subscriber field?
              if : {$in: [userId, "$subscribers.subscriber"]},
              then : true,
              else : false
            }
          }
        }
      },
      {
        //What all to project and return
        $project : {
          fullName : 1,
          userName : 1,
          email : 1,
          avatar : 1,
          coverImage : 1,
          subscriberCount : 1,
          channelsSubscribedToCount : 1,
          isSubscribed : 1
        }
      }
    ])

    if(!aggregate?.length) {
      throw new ApiError (400,"Channel doesn't exist")
    }

    res.status(200)
    .json(new ApiResponse(200, {aggregate}, "Channel Information fetched"))
  }
)

//Mongo subpipeline
//To get watch History of a logged in User.
const getWatchHistory = asyncHandler(
  async(req, res) => {
    const userId = req?.userId

    const history = await User.aggregate([
      {
        //Match the logged in userId with the document
        $match : {
          _id : new mongoose.Types.ObjectId(userId)
        }
      }, 
      {
        //Populate with the video details matching with the video Ids in watchHistory to ids in video
        $lookup : {
          from : "videos",
          localField : "watchHistory",
          foreignField : "_id",
          as : "watchHistory",
          pipeline : [
            {
              //Populate with video owner details of each video
              $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as: "owner",
                pipeline : [
                  {
                    $project : {
                      fullName : 1,
                      userName : 1,
                      avatar : 1
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ])
    
    res.status(200)
    .json(new ApiResponse(200, {history}, "Watch History fetched successfully"))
})


console.log("End of User Controller")
module.exports = {
  registerUser,
  logIn,
  logOut,
  regenerateAccessToken,
  changeCurrentPassword,
  updateUserDetails,
  getCurrentUser,
  updateImages,
  getUserChannelProfile,
  getWatchHistory
} 
