const admin=require("../model/adminModel")


const adminHomeGet=async(req,res)=>{
    res.render("admin/adminHome")
}

const adminLoginGet=async(req,res)=>{
    res.render("admin/adminLogin")
}

module.exports={adminHomeGet,adminLoginGet}