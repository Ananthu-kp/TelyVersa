const User= require("../model/userModel")
const Product= require("../model/productModel")

const renderWishlistPage= async(req,res)=>{
    try{
        const userEmail= req.session.user
       
        const userData= await User.findOne({email:userEmail});  
        res.render("user/wishlist",{data:userData, user:userEmail})
    }catch(error){
        console.log(error);
    }
}

const productAddWishlist=async(req,res)=>{
    try{
        const productId= req.session.productId
        console.log(productId);
    }catch(error){
        console.log(error);
    }
}


module.exports={
    renderWishlistPage,
    productAddWishlist
}