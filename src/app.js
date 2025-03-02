const cookieParser = require("cookie-parser");
const express = require("express")
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const ApiResponse = require("./utils/apiResponse.js");
const ApiError = require("./utils/apiError.js");
const path = require("path")

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log("3 Start of App")

//---------------------------------------------------------------
//DEFAULT MIDDLEWARES
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}
));

app.use(express.json({limit: "16kb"})); //To parse JSON data Content Type

app.use(express.urlencoded({extended: true, limit: "16kb"})); //To parse urlencoded aka form data Content Type

app.use(express.static('public')); // To serve static files

app.use(cookieParser()); // To access cookies both from request and store as response

//---------------------------------------------------------------
//Import router
const router = require("./routes/user-router.js");

//API ENDPOINT AS MIDDLEWARE
app.use("/api/user",router)



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

