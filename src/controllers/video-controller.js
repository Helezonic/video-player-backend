const asyncHandler = require("../utils/asyncHandler.js");
const { Video } = require("../models/video-model.js");
const { uploadToCloudinary } = require("../utils/cloudinary.js"); // Utility to upload files to Cloudinary
const ApiError = require("../utils/apiError.js");
const ApiResponse = require("../utils/apiResponse.js");
const { User } = require("../models/user-model.js");


const uploadVideo = asyncHandler(async (req, res) => {
  console.log("-------------VIDEO UPLOAD------------");

  const { title, description } = req.body;
  const ownerId = req.userId; // Extracted from JWT middleware

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  console.log ("title-", title, "description-", description)

  if (!req.files?.video || !req.files?.thumbnail) {
    throw new ApiError(400, "Both video and thumbnail files are required");
  }

  // Upload video to Cloudinary (or another cloud storage service)
  const videoPath = req.files?.video[0]?.path;
  console.log(req.files?.video[0])
  const videoUrl = await uploadToCloudinary(videoPath, "Videos");
  if (!videoUrl) {
    throw new ApiError(500, "Failed to upload video");
  }

  // Upload thumbnail to Cloudinary
  const thumbnailPath = req.files.thumbnail[0].path;
  const thumbnailUrl = await uploadToCloudinary(thumbnailPath, "Thumbnails");
  if (!thumbnailUrl) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  console.log("videoUrl", videoUrl, "thumbnailUrl", thumbnailUrl)
  
  // Create a new video instance in the database
  const video = await Video.create({
    videoFile : videoUrl,
    thumbnail : thumbnailUrl,
    title,
    description,
    views : 0,
    isPublished : true,
    owner: ownerId, // Associate with the logged-in user
  });

  res.status(201).json(new ApiResponse(201, { video }, "Video uploaded successfully"));
});


// Function to get all videos of logged in User
const findOwnerVideos = asyncHandler(async (req, res) => {
  const ownerId = req.userId; // Extracted from JWT middleware

  console.log("Fetching videos for owner:", ownerId);

  // Fetch videos from the database where owner matches userId
  const videos = await Video.find({ owner: ownerId });

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this user");
  }

  res.status(200).json(new ApiResponse(200, { videos }, "Videos fetched successfully"));
});




// Function to get all videos for a specific user
const findUserVideos = asyncHandler(async (req, res) => {
  const userId = req.params.id; 

  console.log("Fetching videos for owner:", userId);

  // Fetch videos from the database where owner matches userId
  const videos = await Video.find({ owner: userId });

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this user");
  }

  res.status(200).json(new ApiResponse(200, { videos }, "Videos fetched successfully"));
});




//Add to watchHistory, increase a view to video
const addToWatchHistory = asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  console.log(videoId, "videoId")
  const userId = req.userId; // Extracted from JWT middleware

  // Find the video and increment its views
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.views += 1;
  await video.save();

  // Find the user and add the video to their watch history
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (!user.watchHistory.includes(videoId)) {
    user.watchHistory.push(videoId);
    await user.save();
  }

  res.status(200).json({
    message: "View added and video added to watch history",
    videoViews: video.views,
  });
})




//Get video details
/* const getVideoDetails = asyncHandler(async (req,res) => {
  
}) */


module.exports = {
  uploadVideo,
  findOwnerVideos,
  findUserVideos,
  addToWatchHistory
};