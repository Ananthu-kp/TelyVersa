const express = require("express");
const path = require("path");
const app = express();
const session=require("express-session")
const nocache= require("nocache")
const dotenv=require("dotenv")
dotenv.config()
 
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname, "public")))
app.set("view engine","ejs")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoute = require("./routes/userRouter")
const adminRoute = require("./routes/adminRouter")
const db=require("./DB/db")

app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: process.env.SECRET_KEY,
        // cookie: { secure: false },
    })
);

app.use(nocache())

app.use("/",userRoute)
app.use("/admin",adminRoute)

app.listen(3000,()=>console.log("Server start")) 

