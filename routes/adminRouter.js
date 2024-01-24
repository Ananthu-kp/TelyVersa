const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")
const productController=require("../controller/productController")

router.get("/",adminController.adminHomeGet)
router.get("/login",adminController.adminLoginGet)
router.post("/login",adminController.adminVerify)

router.get("/userList",adminController.userList)

router.get("/addProduct",productController.addProductGet)

module.exports=router; 