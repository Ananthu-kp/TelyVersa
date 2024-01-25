const User = require("../model/userModel")

const isLogged = (req, res, next)=>{
    if(req.session.user){
       User.findOne({email : req.session.user}).lean()
       .then((data) => {
        if (data.isBlocked === 1) {
            res.redirect("/login");
        } else {
            next();
        }
    }) 
    }else{
        res.redirect("/login")
    }
}

module.exports = {
    isLogged
}