const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")

router.get("/",adminController.adminHomeGet)
router.get("adminlogin",adminController.adminLoginGet)

module.exports=router; 