const Product=require("../model/productModel")

const addProductGet=async(req,res)=>{
    res.render("admin/adminAddProduct")
}


const productListGet=async(req,res)=>{
    res.render("admin/adminViewProducts")
}

const addProduct=async(req,res)=>{
    try{
        const productlist=req.body;
    }catch(error){

    }
};

module.exports={
    addProductGet,
    productListGet,
    addProduct
}