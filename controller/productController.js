const Product=require("../model/productModel")

const addProductGet=async(req,res)=>{
    res.render("admin/adminAddProduct")
}


const productListGet=async(req,res)=>{
    res.render("admin/adminViewProducts")
}


module.exports={
    addProductGet,
    productListGet
}