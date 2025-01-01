
//Whatever function is asynchronous, is send as parameter to asyncHandler, which goes through a try-catch.
//Is a higher order function that accepts a function and returns a function.

const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req,res,next)
      console.log("Inside asyncHandler")
    } catch (error) {
      console.log("Error in asyncHandler", error);
      next(error)
    }
  }
}

module.exports = asyncHandler