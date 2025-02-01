const { Router } = require("express");
const {registerUser, logIn, logOut} = require("../controllers/user-controller.js");
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
]),registerUser)

//login endpoint
router.route("/login").post(logIn)

//SECURED ROUTES
//logout endpoint
router.route("/logout").post(verifyJWT,logOut)

//update user endpoint
//router.route("/update")



module.exports = router


console.log("End of Router")