const { Router } = require("express");
const { uploadVideo, findOwnerVideos,findUserVideos, addToWatchHistory } = require("../controllers/video-controller.js");
const { upload } = require("../middlewares/multer-middleware.js");
const { verifyJWT } = require("../middlewares/auth-middleware.js");

const router = Router();

// API ENDPOINTS - route("url").httpmethod(middleware, controller)

// Video upload endpoint - FORM BASED
router.route("/upload").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

//Get logged in user's video
router.route("/get-owner-videos").get(verifyJWT, findOwnerVideos)

//Get other user's videos - User Id in Paramas
router.route("/get-user-videos/:id").get(verifyJWT,findUserVideos)

//Add to watchHistory, increase view - Video Id in Params
router.route("/add-to-history/:id").post(verifyJWT, addToWatchHistory)

//Fetch video details
router.route("/:id")

module.exports = router;