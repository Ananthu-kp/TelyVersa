const User = require("../model/userModel")
const Admin= require("../model/adminModel")

// const isLogged = (req, res, next)=>{
//     if(req.session.user){
//        User.findOne({email : req.session.user}).lean()
//        .then((data) => {
//         if (data.isBlocked === 1) {
//             res.redirect("/login");
//         } else {
//             next();
//         }
//     }) 
//     }else{
//         res.redirect("/login")
//     }
// }

const isLogged = (req, res, next)=>{
    if(req.session.user){
       next() 
    }else{
        res.redirect("/login")
    }
}

const isBlocked = async (req, res , next) => {
    try {
        if(req.session.user){
            const userData = await User.findOne ({email : req.session.user});
            if(userData.isBlocked === 0){
                next()
            }else{
                delete req.session.user
                res.render("user/userLogin" , {message : "Admin blocked your account"});
            }
        }else{
            next()
        }
    } catch (error) {
        
    }
}


const isAdmin = (req, res, next) => {
    if (req.session.admin) {
        Admin.findOne({email: req.session.admin}).lean()
            .then((data) => {
                if (data) {
                    next();
                } else {
                    res.redirect("/admin/login");
                }
            })
            .catch((error) => {
                console.error("Error", error);
                res.status(500).send("Internal Server Error");
            });
    } else {
        res.redirect("/admin/login");
    }
};

module.exports = {
    isLogged,
    isAdmin,
    isBlocked
}