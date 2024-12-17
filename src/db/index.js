
const mongoose = require ("mongoose")
const {dbName} = require ("../constants.js");
const express = require("express")

const app= express()

const connectdb = async () => {
  try {

    const connect = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`)
    if(connect){
      console.log("MONGODB Connection Successful!", connect.connection.host)
    }

    app.on("error", (error)=>{"Error Communicating to MongoDB.", error})

    //After connection attempt, listen on port.
    app.listen(process.env.PORT, () => {
      console.log(`App listening on Port ${process.env.PORT}!`)
    })
    
  } catch (error) {
    console.log("MongoDB connection failed!", error)
  }
}

module.exports = connectdb;