const cookieParser = require("cookie-parser");
const express = require("express")
const cors = require("cors");
const ApiResponse = require("./utils/apiResponse.js");
const ApiError = require("./utils/apiError.js");

app = express();
console.log("3 Start of App")


//DEFAULT MIDDLEWARES
app.use(cors());

app.use(express.json());

app.use(express.urlencoded());

app.use(express.static('public'));

app.use(cookieParser());


//Import router
const router = require("./routes/user-router.js");

app.use("/api/user",router)

// Error handling middleware caught and send from AsyncHandler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    const response = new ApiResponse(err.statusCode, null, err.message);
    return res.status(err.statusCode).json(response);
  }

  // Default to 500 server error
  const response = new ApiResponse(500, null, 'Internal Server Error');
  res.status(500).json(response);
});

//Export
module.exports = app

