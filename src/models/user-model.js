const jwt = require("jsonwebtoken")
require ("dotenv").config()
const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require ("bcrypt")

const userSchema = new Schema({
    userName : {
      type : String,
      required : true,
      unique : true,
      lowercase : true,
      trim : true,
      index : true
    },
    email : {
      type : String,
      required : true,
      unique : true,
      lowercase : true,
      trim : true
    },
    fullName : {
      type : String,
      required : true,
      index : true
    }, 
    avatar : {
      type : String, //Image URL
      required : true
    },
    coverImage : {
      type : String //Image URL
    },
    watchHistory : [
      {
        type : Schema.Types.ObjectId,
        ref : "Video"  
      }
    ],
    password : {
      type : String,
      required : [true, "Password is required"]
    },
    refreshToken : {
      type : String
    }
  },{
  timestamps : true
})

// Password encryption with bcrypt - Used as middleware, hence next() is to be returned
userSchema.pre("save", async function (next){
  if(this.isModified("password"))
    this.password = await bcrypt.hash(this.password,10)
  return next()
})


//USER DEFINED INSTANT METHODS
//Password validation - Compares hashed passwords - Check Notion notes
userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

//Generate accessToken from the payload of the User document
userSchema.methods.generateAccessToken = async function() {
  return jwt.sign(
    {
    _id : this._id,
    userName : this.userName,
    email : this.email,
    fullName : this.fullName,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

//Generate RefreshToken from the payload of the User document
userSchema.methods.generateRefreshToken = async function() {
  return jwt.sign(
    {
    _id : this._id
    },
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

exports.User = mongoose.model("User", userSchema)

