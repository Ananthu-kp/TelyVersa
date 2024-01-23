const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")

router.get("/",adminController.adminHomeGet)
router.get("/login",adminController.adminLoginGet)
router.get("/addProduct",adminController.addProductGet)

module.exports=router; 