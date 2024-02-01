const express=require("express");
const router=express();

const {isLogged} = require("../middlewares/Auth")

const userController = require("../controller/userController");

router.get("/",userController.userHomeGet)
router.get("/login",userController.userLoginGet)
router.post("/login",userController.verifyUser)
router.get("/signup",userController.userSignupGet)
router.post("/signup",userController.insertUser)
router.get("/otp",userController.renderOtpPage)
router.post("/verify",userController.verifyOtp)
router.get("/resendOtp",userController.resendOTP)
router.get("/logout",isLogged,userController.logoutUser)
router.get("/pageError-404", userController.pageError)

router.get('/forgot', userController.forgotPasswordGet)
router.post('/forgotEmailVerify',userController.forgotEmailVerify)
router.get('/forgotOtp', userController.forgotGet)
router.post('/forgotOtp', userController.forgotOtpVerify)
router.get('/repassword', userController.newPasswordGet)
router.post("/newpass", userController.newPassword)


router.get("/productDetails",userController.productDetailsGet)


module.exports=router;