const ApiError = require("../utils/apiError.js");
const jwt = require("jsonwebtoken")
const asyncHandler = require("../utils/asyncHandler.js");

const verifyJWT = asyncHandler(
  async (req,_,next) => {
    try {
      console.log("---VERIFY JWT--- Req cookies", req.cookies)
      const accessToken = req.cookies?.accessToken
      
      // if accessToken is absent
      if(!accessToken)
        throw new ApiError(400, "No User Logged In")

      const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY)
      console.log("Auth Middleware decodedToken", decodedToken)
      //if accessToken is incorrect
      if(!decodedToken)
        throw new ApiError(400, "Error in decoded Token")
      
      req.userId = decodedToken?._id
      next()
    } catch (error) {
      throw new ApiError(401, "Token decoding error")
    }
  }
)

module.exports = {verifyJWT}