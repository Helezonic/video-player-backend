require ("dotenv").config();
const {connectdb} = require("./db");
const app = require("./app.js")
const path = require("path")

console.log("1 Start of Index")

//Connect the DATABASE
connectdb().then(()=>{
  //After connection attempt, listen on port.
  app.listen(process.env.PORT, () => {
    console.log(`App listening on Port ${process.env.PORT}!`)
    
  })
});

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname,"../views/index.html"))
})

app.get("/about", (_,res) => {
  res.sendFile(path.join(__dirname,"../views/about.html"))
})

console.log("2 End of Index")