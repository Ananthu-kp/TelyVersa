const Admin =require("../model/adminModel")
const bcrypt=require("bcrypt")

const adminLoginGet=async(req,res)=>{
    res.render("admin/adminLogin")
}


const adminVerify = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);

        const findAdmin = await Admin.findOne({ email: email });

        if (!findAdmin) {
            res.redirect("/admin/login");
        } else {
            if(findAdmin.password==password){
                res.redirect("/admin");
            }else {
                req.session.admin = true;
                 res.redirect("/admin/login");
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const adminHomeGet=async(req,res)=>{
    res.render("admin/adminHome")
}


const userList= async(req,res)=>{
    res.render("admin/users")
}


module.exports={
    adminHomeGet,
    adminLoginGet,
    adminVerify,
    userList
}