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
  res.send(`
    <div style="height: 100%; width: 100%; border: 1px solid blue; display:flex ; flex-direction: column;  margin:0 ; padding: 0; background-color:indigo">
      <div style="border: 1px solid red; width: 250px; margin:auto ; padding:20px ; background-color:white">
        <h1>ABOUT. </h1>
        <a href="/"><h2><-- Go home</h2></a>
        <a href="/api/user/register"><h2>REGISTER</h2></a>
      <div>
    </div>
    `)
})

console.log("2 End of Index")