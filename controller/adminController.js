const Admin =require("../model/adminModel")
const bcrypt=require("bcrypt")

const adminLoginGet=async(req,res)=>{
    if(req.session.admin){
        res.redirect("/admin")
    }else{
        res.render("admin/adminLogin")
    }
    
}


const adminVerify = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        console.log(password);

        const findAdmin = await Admin.findOne({ email: email });
        req.session.admin = findAdmin.email;    

        if (!findAdmin) {
            res.redirect("/admin/login");
        } else {
            if(findAdmin.password==password){
                res.redirect("/admin");
            }else {
               
                 res.redirect("/admin/login");
            }
        }
    } catch (error) {
        console.error(error);
    }
};



const adminHomeGet=async(req,res)=>{
   
        res.render("admin/adminHome",{dashboard:true})
    
        
    
    
}



const adminLogout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message);
    }
};

  


module.exports={
    adminHomeGet,
    adminLoginGet,
    adminVerify,
    adminLogout
    
}