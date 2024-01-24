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



const adminLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
          if (err) {
            console.log("Logout error");
            res.redirect("/admin");
          }
          console.log("Logged out successfully");
          res.redirect("/admin/login");
        });
      } catch (error) {
        console.log("Logout Error");
      }
};


module.exports={
    adminHomeGet,
    adminLoginGet,
    adminVerify,
    adminLogout
    
}