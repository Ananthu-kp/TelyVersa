const admin=require("../model/adminModel")


const adminHomeGet=async(req,res)=>{
    res.render("admin/adminHome")
}

const adminLoginGet=async(req,res)=>{
    res.render("admin/adminLogin")
}

const addProductGet=async(req,res)=>{
    res.render("admin/adminAddProduct")
}
module.exports={
    adminHomeGet,
    adminLoginGet,
    addProductGet
}