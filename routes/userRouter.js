const express=require("express");
const router=express();

const userController = require("../controller/userController");

router.get("/",userController.userHomeGet)
router.get("/login",userController.userLoginGet)
router.get("/signup",userController.userSignupGet)
router.post("/signup",userController.insertUser)
router.post("/otp",userController.renderOtpPage)
router.post("/verify",userController.verifyOtp)

module.exports=router;