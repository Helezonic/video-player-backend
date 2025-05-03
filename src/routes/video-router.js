const { Router } = require("express");
const { uploadVideo } = require("../controllers/video-controller");
const verifyJWT = require("../middleware/verifyJWT");
const upload = require("../middlewares/multer-middleware").upload;

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

module.exports = router;