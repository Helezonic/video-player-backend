
const mongoose = require ("mongoose")
const {dbName} = require ("../constants.js");

console.log("Start of DB")

const connectdb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`)
    if(connect){
      console.log("MONGODB Connection Successful!", connect.connection.host)
    }
    /* app.on("error", (error)=>{"Error Communicating to MongoDB.", error}) */

  } catch (error) {
    console.log("MongoDB connection failed!", error)
  }
}

console.log("End of DB")

module.exports = {connectdb};