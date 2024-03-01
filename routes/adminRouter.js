const express = require("express")
const router = express.Router();

const adminController=require("../controller/adminController")
const productController=require("../controller/productController")
const userListController=require("../controller/userListController")
const categoryController=require("../controller/categoryController")
const productMulter=require("../multer/multerProduct")
const {isAdmin}=require("../middlewares/Auth")
const couponController= require("../controller/couponController")
const salesReportController= require("../controller/salesReportController")
const orderController=require("../controller/orderController")

router.get("/",isAdmin,adminController.adminHomeGet)
router.get("/login",adminController.adminLoginGet)
router.post("/login",adminController.adminVerify)
router.get("/logout",isAdmin,adminController.adminLogout)


router.get("/userList",isAdmin,userListController.displayUser)
router.get("/blockuser/:id",isAdmin,userListController.blockUser)
router.get("/unblockuser/:id",isAdmin,userListController.unblockUser)


router.get("/addproduct",isAdmin, productController.addProductGet);
router.post("/addproduct",isAdmin, productMulter.array('images', 5), productController.addProduct);
router.get("/productList",isAdmin,productController.productListGet)
router.get("/editProduct", isAdmin,productController.editProductGet)
router.post("/editProduct/:id",isAdmin,productMulter.array("images", 5), productController.editProduct)
router.get("/blockProduct",isAdmin,productController.blockProduct);
router.get("/unblockProduct",isAdmin,productController.unblockProduct)
router.post("/addProductOffer", isAdmin, productController.addProductProductOffer)
router.post("/removeProductOffer", isAdmin, productController.removeProductProductOffer)



router.get("/category", isAdmin, categoryController.categoryGet)
router.post("/add-Category", isAdmin, categoryController.addCategory)
router.get("/listCategory",isAdmin,categoryController.listCategoryGet)
router.get("/unListCategory", isAdmin, categoryController.unlistCategoryGet)
router.get("/editCategory",isAdmin, categoryController.editCategoryGet)
router.post("/editCategory/:id",isAdmin, categoryController.editCategory)
router.post("/addCategoryOffer", isAdmin, categoryController.addCategoryOffer)
router.post("/removeCategoryOffer", isAdmin, categoryController.removerCategoryOffer)

router.get("/orderList",isAdmin,orderController.orderList)
router.get("/orderDetailsAdmin",isAdmin,orderController.orderDetails)
router.get("/changeStatus", isAdmin, orderController.changeOrderStatus)



router.get("/coupon",isAdmin,couponController.getCouponPage);
router.post("/createCoupon",isAdmin,couponController.createCoupon)
router.post("/coupons/:id", couponController.deleteCoupon);


router.get("/salesReport", isAdmin, salesReportController.getSalesReportPage)
router.get("/salesToday", isAdmin, salesReportController.salesToday)
router.get("/salesWeekly", isAdmin, salesReportController.salesWeekly)
router.get("/salesMonthly", isAdmin, salesReportController.salesMonthly)
router.get("/salesYearly", isAdmin, salesReportController.salesYearly)
router.get("/dateWiseFilter", isAdmin, salesReportController.dateWiseFilter)
router.post("/generatePdf", isAdmin, salesReportController.generatePdf)
router.post("/downloadExcel", isAdmin, salesReportController.downloadExcel)
router.post("/deleteImage", isAdmin, productController.deleteSingleImage)
module.exports=router; 