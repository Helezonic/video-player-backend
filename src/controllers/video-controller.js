const asyncHandler = require("../utils/asyncHandler.js");
const { Video } = require("../models/video-model.js");
const { uploadToCloudinary } = require("../utils/cloudinary.js"); // Utility to upload files to Cloudinary
const ApiError = require("../utils/apiError.js");
const ApiResponse = require("../utils/apiResponse.js");


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
    owner: ownerId, // Associate with the logged-in user
  });

  res.status(201).json(new ApiResponse(201, { video }, "Video uploaded successfully"));
});


// Function to get all videos for a specific owner
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


// Function to get all videos for a specific owner
const findUserVideos = asyncHandler(async (req, res) => {
  const ownerId = req.params.id; // Extracted from JWT middleware

  console.log("Fetching videos for owner:", ownerId);

  // Fetch videos from the database where owner matches userId
  const videos = await Video.find({ owner: ownerId });

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this user");
  }

  res.status(200).json(new ApiResponse(200, { videos }, "Videos fetched successfully"));
});


module.exports = {
  uploadVideo,
  findOwnerVideos,
  findUserVideos
};