require ("dotenv").config()
const { Schema, default: mongoose } = require("mongoose");

const subscriptionSchema = new Schema({
  subscriber : {
    type : Schema.Types.ObjectId,
    ref : "User"
  },
  channel : {
    type : Schema.Types.ObjectId,
    ref : "User"
  }
}, {
  timestamps : true
})


exports.Subscription = mongoose.model("Subscription", subscriptionSchema)