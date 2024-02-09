const express=require("express");
const router=express();

const {isLogged} = require("../middlewares/Auth")

const userController = require("../controller/userController");
const cartController=require("../controller/cartController")
const profileController=require("../controller/profileController")

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
router.get("/shop",userController.getShop)


router.get("/cart",isLogged,cartController.cartPageGet)
router.post("/cart", isLogged,cartController.addToCart)
router.post("/changeQuantity",isLogged,cartController.changeQuantity)
router.get("/deleteItem", isLogged, cartController.deleteProduct)


router.get("/profile", isLogged, profileController.profileGET)
router.get("/addAddress", isLogged, profileController.addAddressGET)
router.post("/addAddress", isLogged, profileController.addAddress)
router.get("/editAddress", isLogged, profileController.editAddressGET),
router.post("/editAddress", isLogged, profileController.editAddress)
router.get("/deleteAddress", isLogged, profileController.deleteAddressGET)
router.post("/editUserDetails", isLogged, profileController.editUserDetails)

module.exports=router;