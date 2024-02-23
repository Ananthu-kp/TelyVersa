const express=require("express");
const router=express();

const {isLogged , isBlocked} = require("../middlewares/Auth")

const userController = require("../controller/userController");
const cartController=require("../controller/cartController")
const profileController=require("../controller/profileController")
const orderController=require("../controller/orderController")
const wishListController=require("../controller/wishlistController")




router.get("/" , isBlocked ,userController.userHomeGet)
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
router.get("/search", userController.searchProducts)
router.get("/filter", userController.filterProduct)
router.post("/sortProducts", userController.getSortProducts)


router.get("/cart",isLogged,isBlocked,cartController.cartPageGet)
router.post("/cart", isLogged,isBlocked,cartController.addToCart)
router.post("/changeQuantity",isLogged,cartController.changeQuantity)
router.get("/deleteItem", isLogged, cartController.deleteCartProduct)


router.get("/profile", isLogged, isBlocked, profileController.profileGET)
router.get("/addAddress", isLogged ,isBlocked, profileController.addAddressGET)
router.post("/addAddress", isLogged , isBlocked,profileController.addAddress)
router.get("/editAddress", isLogged ,isBlocked, profileController.editAddressGET),
router.post("/editAddress", isLogged ,isBlocked, profileController.editAddress)
router.get("/deleteAddress", isLogged ,isBlocked, profileController.deleteAddressGET)
router.post("/editUserDetails", isLogged ,isBlocked, profileController.editUserDetails)
router.get("/orderDetails",isLogged ,isBlocked,profileController.orderDetails)
router.post("/verifyOldPassword",isLogged ,profileController.verifyOldPassword)
router.post("/changepassword", isLogged, profileController.changePassword)




router.get("/checkout",isLogged,orderController.checkoutPageGET)
router.post('/orderPlaced', isLogged, orderController.placeOrder)
router.post("/verifyPayment", isLogged, orderController.verify)
router.get("/cancelOrder",isLogged,orderController.cancelOrder)
router.post('/applyCoupon', isLogged, isBlocked, orderController.applyCoupon)



router.get("/wishlist",isLogged, isBlocked,wishListController.renderWishlistPage)
router.post("/addToWishlist",isLogged,isBlocked,wishListController.productAddWishlist)
router.get("/deleteWishlist",isLogged,isBlocked,wishListController.deleteWishlist)

module.exports=router;