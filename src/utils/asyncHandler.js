


//Whatever function is asynchronous, is send as parameter to asyncHandler, which goes through a try-catch.

const asyncHandler = (fn) => {
  async (req, res, next) => {
    try {
      await fn(req,res,next)
    } catch (error) {
      res.status(error.code).json(
        {
          success: false,
          message: error.message
        }
      )
    }
  }
}

module.exports = asyncHandler