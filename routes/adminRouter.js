const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")
const productController=require("../controller/productController")
const userListController=require("../controller/userListController")
const categoryController=require("../controller/categoryController")
const productMulter=require("../multer/multerProduct")
const {isAdmin}=require("../middlewares/Auth")



router.get("/",adminController.adminHomeGet)
router.get("/login",adminController.adminLoginGet)
router.post("/login",adminController.adminVerify)
router.get("/logout",adminController.adminLogout)


router.get("/userList",userListController.displayUser)
router.get("/blockuser/:id",userListController.blockUser)
router.get("/unblockuser/:id",userListController.unblockUser)


router.get("/addproduct", productController.addProductGet);
router.post("/addproduct", productMulter.array('image', 5), productController.addProduct);
router.get("/productList",productController.productListGet)


router.get("/category",  categoryController.categoryGet)
router.post("/add-Category",  categoryController.addCategory)
router.get("/allCategory",  categoryController.categoryAllGet)
router.get("/listCategory",categoryController.listCategoryGet)
router.get("/unListCategory",  categoryController.unlistCategoryGet)
router.get("/editCategory", categoryController.editCategoryGet)
router.post("/editCategory/:id", categoryController.editCategory)

module.exports=router; 