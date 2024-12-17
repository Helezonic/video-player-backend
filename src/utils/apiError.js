
// It is a ApiError class that extends the exisitng Error class, so whenever Error occurs, this constructor can be called and passed.

class ApiError extends Error {
  constructor (statusCode, message="Something went wrong", errors =[], stack = "") {
    super(message) //The message send here will override any message
    this.statusCode = statusCode,
    this.data = null,
    this.message = message,
    this.success = false, //For error, success is false
    this.errors = errors
    
    if(stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }

  }
}