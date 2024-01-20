const express=require("express");
const router=express();

const userController = require("../controller/userController");

router.get("/",userController.userHomeGet)
router.get("/login",userController.userLoginGet)
router.get("/signup",userController.userSignupGet)
router.post("/signup",userController.insertUser)
router.get("/otp",userController.verifyOtp)
router.post("/otp",userController.verifyOtp)

module.exports=router;