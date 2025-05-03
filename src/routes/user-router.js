const { Router } = require("express");
const {registerUser, logIn, logOut, regenerateAccessToken, changeCurrentPassword, updateUserDetails, getCurrentUser, updateImages, getUserChannelProfile, getWatchHistory, getAllUsers} = require("../controllers/user-controller.js");
const { upload } = require("../middlewares/multer-middleware.js");
const { verifyJWT } = require("../middlewares/auth-middleware.js");

console.log("5 Start of Router")

const router = Router()

//API ENDPOINTS - route("url").httpmethod(middleware, controller)
//register endpoint - FORM BASED
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

//login endpoint - FORM BASED
router.route("/login").post(logIn) //Test Passed

//SECURED ROUTES -- Only logged in user can hit the endpoint
//logout endpoint - LOG OUT BUTTON, REDIRECT TO HOME IF SUCCESS
router.route("/logout").post(verifyJWT,logOut) //Test Passed

//get current user endpoint
router.route("/get-user").get(verifyJWT, getCurrentUser) //Test Passed

//regenerate accesstoken - REDIRECTION
router.route("/regen-access").get(regenerateAccessToken)

//update user-pass endpoint - FORM BASED, REDIRECT TO CHANNEL PAGE LOGGED IN
router.route("/update-pass").post(verifyJWT,changeCurrentPassword) //Test Passed

//update user-image endpoint - FORM BASED, REDIRECT TO CHANNEL PAGE LOGGED IN
router.route("/update-img").post(verifyJWT, upload.fields([
  {
    name : "avatar",
    maxCount : 1
  },
  {
    name : "coverImage",
    maxCount : 1
  }
]), updateImages) //Test Passed

//update user-details endpoint - FORM BASED, REDIRECT TO CHANNEL PAGE LOGGED IN
router.route("/update-details").post(verifyJWT,updateUserDetails) //Test Passed

//getChannelDetails - CHANNEL BUTTON, OPEN CHANNEL PAGE
router.route("/:id").get(verifyJWT,getUserChannelProfile)

//getWatchHistory - WATCH HISTORY BUTTON, HISTORY PAGE
router.route("/history").get(verifyJWT, getWatchHistory)

//addVideo
//router.route("/add-video").post(verifyJWT, addVideo)

//getAllUsers
router.route("/all-users").get(verifyJWT, getAllUsers)


module.exports = router
console.log("End of Router")