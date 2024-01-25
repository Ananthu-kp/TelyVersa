const express=require("express");
const router=express();

const {isLogged} = require("../middlewares/Auth")

const userController = require("../controller/userController");

router.get("/",userController.userHomeGet)
router.get("/login",userController.userLoginGet)
router.post("/login",userController.verifyUser)
router.get("/signup",userController.userSignupGet)
router.post("/signup",userController.insertUser)
router.post("/otp",userController.renderOtpPage)
router.post("/verify",userController.verifyOtp)
router.get("/logout",isLogged,userController.logoutUser)


module.exports=router;