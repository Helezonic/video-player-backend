const { Router } = require("express");
const {registerUser, logIn, logOut, regenerateAccessToken, changeCurrentPassword, updateUserDetails, getCurrentUser, updateImages, getUserChannelProfile, getWatchHistory, getAllUsers, getUser} = require("../controllers/user-controller.js");
const { upload } = require("../middlewares/multer-middleware.js");
const { verifyJWT } = require("../middlewares/auth-middleware.js");
const { subscribeToChannel } = require("../controllers/subscription-controller.js");

console.log("5 Start of User Router")

const router = Router()

//API ENDPOINTS

//AUTHENTICATION
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

//regenerate accesstoken - REDIRECTION
router.route("/regen-access").get(regenerateAccessToken)


//UPDATE USER
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


//USER DETAILS
//get current user 
router.route("/get-user").get(verifyJWT, getCurrentUser) //Test Passed



//getAllUsers - TO LIST CHANNELS , HOME PAGE
router.route("/all-users").get(verifyJWT, getAllUsers)

//getWatchHistory - WATCH HISTORY BUTTON, HISTORY PAGE
router.route("/history").get(verifyJWT, getWatchHistory)

//getUser
router.route('/:id').get(getUser)

//getChannelDetails - CHANNEL BUTTON, OPEN CHANNEL PAGE
/* router.route("/:id").get(verifyJWT,getUserChannelProfile) */


//SUBSCRIPTION
//Subscription route
router.route("/subscribe/:id").post(verifyJWT,subscribeToChannel)

module.exports = router
console.log("End of Router")