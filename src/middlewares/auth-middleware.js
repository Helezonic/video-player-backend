const ApiError = require("../utils/apiError.js");
const jwt = require("jsonwebtoken")
const asyncHandler = require("../utils/asyncHandler.js");

const verifyJWT = asyncHandler(
  async (req,_,next) => {
    try {
      console.log("Req cookies", req.cookies, "Req Header", req.header)
      const accessToken = req.cookies?.accessToken
      if(!accessToken)
        throw new ApiError(400, "No User Logged In")

      const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY)
      console.log("Auth Middleware decodedToken", decodedToken)

      req.userId = decodedToken?._id
      next()
    } catch (error) {
      throw new ApiError(401, "Token decoding error")
    }
  }
)

module.exports = {verifyJWT}