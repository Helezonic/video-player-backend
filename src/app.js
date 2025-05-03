const cookieParser = require("cookie-parser");
const express = require("express")
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const ApiResponse = require("./utils/apiResponse.js");
const ApiError = require("./utils/apiError.js");
const path = require("path")

const app = express();

console.log("3 Start of App")

//---------------------------------------------------------------
//DEFAULT MIDDLEWARES
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true // To accept cookies & auth Header from client
}
));

app.use(express.json({limit: "16kb"})); //To parse JSON data Content Type

app.use(express.urlencoded({extended: true, limit: "16kb"})); //To parse urlencoded aka form data Content Type

app.use(express.static('public')); // To serve static files from public directory

app.use(cookieParser()); // To access cookies from request

//---------------------------------------------------------------
//Import router
const userRouter = require("./routes/user-router.js");
const videoRouter = require("./routes/video-router.js");

//API ENDPOINT AS MIDDLEWARE
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/user",userRouter)

app.use("/api/video",videoRouter)



//---------------------------------------------------------------
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

