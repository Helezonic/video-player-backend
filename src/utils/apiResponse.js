

//Create a constructor from a class for a response json that can be used for every API interaction.

class ApiResponse {
  constructor (statusCode, data, message="Success"){ //Since it is a response, the message would be success
    this.statusCode = statusCode,
    this.data = data,
    this.message = message,
    this.success = statusCode < 400 //As status code above 400 in general is server aka backend issue, hence comes under apiError
  }
}

module.exports = ApiResponse