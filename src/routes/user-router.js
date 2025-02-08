const { Router } = require("express");
const {registerUser, logIn, logOut, regenerateAccessToken, changeCurrentPassword, updateUserDetails, getCurrentUser, updateImages} = require("../controllers/user-controller.js");
const { upload } = require("../middlewares/multer-middleware.js");
const { verifyJWT } = require("../middlewares/auth-middleware.js");

console.log("5 Start of Router")

const router = Router()

//API ENDPOINTS - route("url").httpmethod(middleware, controller)
//register endpoint
router.route("/register").post(upload.fields([
  {
    name : "avatar",
    maxCount : 1
  },
  {
    name : "coverImage",
    maxCount : 1
  }
]),registerUser) //Test Passed

//login endpoint
router.route("/login").post(logIn) //Test Passed

//SECURED ROUTES -- Only logged in user can hit the endpoint
//logout endpoint
router.route("/logout").post(verifyJWT,logOut) //Test Passed

//get current user endpoint
router.route("/get-user").post(verifyJWT, getCurrentUser)

//regenerate accesstoken
router.route("/regen-access").post(regenerateAccessToken)

//update user-pass endpoint
router.route("/update-pass").post(verifyJWT,changeCurrentPassword) //Test Passed

//update user-image endpoint
router.route("/update-img").post(verifyJWT, upload.fields([
  {
    name : "avatar",
    maxCount : 1
  },
  {
    name : "coverImage",
    maxCount : 1
  }
]), updateImages)

//update user-details endpoint
router.route("/update-details").post(verifyJWT,updateUserDetails) //Test Passed


module.exports = router


console.log("End of Router")