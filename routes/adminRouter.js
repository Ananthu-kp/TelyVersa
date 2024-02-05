const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")
const productController=require("../controller/productController")
const userListController=require("../controller/userListController")
const categoryController=require("../controller/categoryController")
const productMulter=require("../multer/multerProduct")
const {isAdmin}=require("../middlewares/Auth")



router.get("/",isAdmin,adminController.adminHomeGet)
router.get("/login",adminController.adminLoginGet)
router.post("/login",adminController.adminVerify)
router.get("/logout",isAdmin,adminController.adminLogout)


router.get("/userList",isAdmin,userListController.displayUser)
router.get("/blockuser/:id",isAdmin,userListController.blockUser)
router.get("/unblockuser/:id",isAdmin,userListController.unblockUser)


router.get("/addproduct",isAdmin, productController.addProductGet);
router.post("/addproduct",isAdmin, productMulter.array('imageInput', 5), productController.addProduct);
router.get("/productList",isAdmin,productController.productListGet)
router.get("/editProduct", isAdmin,productController.editProductGet)
router.post("/editProduct/:id",isAdmin,productMulter.array("imageInput", 5), productController.editProduct)
router.get("/blockProduct",isAdmin,productController.blockProduct);
router.get("/unblockProduct",isAdmin,productController.unblockProduct)


router.get("/category", isAdmin, categoryController.categoryGet)
router.post("/add-Category", isAdmin, categoryController.addCategory)
router.get("/listCategory",isAdmin,categoryController.listCategoryGet)
router.get("/unListCategory", isAdmin, categoryController.unlistCategoryGet)
router.get("/editCategory",isAdmin, categoryController.editCategoryGet)
router.post("/editCategory/:id",isAdmin, categoryController.editCategory)

module.exports=router; 