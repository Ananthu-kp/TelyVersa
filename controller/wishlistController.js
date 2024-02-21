const User= require("../model/userModel")
const Product= require("../model/productModel")

const renderWishlistPage= async(req,res)=>{
    try{
        const userEmail= req.session.user
       
        const userData= await User.findOne({email:userEmail});  

        const cartCount = userData.cart.length;
        const wishlistCount = userData.wishlist.length
        res.render("user/wishlist",{data:userData, user:userEmail, cartCount, wishlistCount})
    }catch(error){
        console.log(error);
    }
}

const productAddWishlist = async (req, res) => {
    try {
        if (!req.session.user) {
            // console.log("User not found")
            res.json({ error: "User not found", status: false })
        }
        const productId = req.body.productId
        const findProduct = await Product.findOne({ _id: productId })
        // console.log("sjdbashgashfgh",findProduct);
        await User.updateOne(
            {
                email: req.session.user,
            },
            {
                $addToSet: {
                    wishlist: {
                        productId: productId,
                        image: findProduct.productImage[0],
                        productName: findProduct.productName,
                        category: findProduct.category,
                        salePrice: findProduct.salePrice,
                        quantity : findProduct.quantity 
                    }
                }
            }
        )
        .then(data => console.log(data))

        res.json({ status: true })
    } catch (error) {
        console.log(error.message);
    }
};


const deleteWishlist = async (req, res) => {
    try {
        const id = req.query.id;
        const result = await User.updateOne(
            { email: req.session.user },
            {
                $pull: {
                    wishlist: { productId: id }
                }
            }
        );
        console.log(result);
        res.redirect("/wishlist");
    } catch (error) {
        console.log(error.message);
    }
};


module.exports={
    renderWishlistPage,
    productAddWishlist,
    deleteWishlist
}