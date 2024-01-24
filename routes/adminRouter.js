const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")
const productController=require("../controller/productController")
const userListController=require("../controller/userListController")



router.get("/",adminController.adminHomeGet)
router.get("/login",adminController.adminLoginGet)
router.post("/login",adminController.adminVerify)
router.get("/logout",adminController.adminLogout)


router.get("/userList",userListController.displayUser)
router.get("/blockuser/:id",userListController.blockUser)
router.get("/unblockuser/:id",userListController.unblockUser)


router.get("/addProduct",productController.addProductGet)
router.get("/productList",productController.productListGet)

module.exports=router; 