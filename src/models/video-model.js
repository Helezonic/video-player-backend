const { Schema, default: mongoose } = require("mongoose");

const videoSchema = new Schema({
  videoFile : {
    type : String, //Video URL 
    required : true
  },
  thumbnail : {
    type : String, //Image URL
    required : true
  },
  title  : {
    type : String,
    required : true
  },
  description : {
    type : String,
    required : true
  },
  duration : {
    type : Number
  },
  views : {
    type : Number
  },
  isPublished : {
    type : Boolean
  },
  owner : {
    type : Schema.Types.ObjectId,
    ref : "User",
    required : true
  }
},
{
  timestamps : true
}
)



exports.Video = mongoose.model("Video", videoSchema)