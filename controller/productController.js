const Product=require("../model/productModel")

const addProductGet=async(req,res)=>{
    res.render("admin/adminAddProduct")
}

module.exports={
    addProductGet
}