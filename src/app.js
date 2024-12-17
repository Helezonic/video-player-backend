const cookieParser = require("cookie-parser");
const express = require("express")
const cors = require("cors")

app = express();


//DEFAULT MIDDLEWARES
app.use(cors());

app.use(express.json());

app.use(express.urlencoded());

app.use(express.static('public'));

app.use(cookieParser());