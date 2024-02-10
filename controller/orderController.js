const User=require("../model/userModel")
const Product=require("../model/productModel")
const Address=require("../model/addressModel")
const mongodb = require('mongodb');


const checkoutPageGET = async (req, res) => {
    try {
        const userEmail = req.session.user; 
        const findUser = await User.findOne({ email: userEmail }); 

        if (!findUser) {
            return res.status(404).send("User not found");
        }

        const userAddress = await Address.findOne({ userId: findUser._id }); 
        const data = await User.aggregate([
            { $match: { email: userEmail } }, 
            { $unwind: "$cart" },
            {
                $project: {
                    ProductId: { $toObjectId: "$cart.ProductId" },
                    quantity: "$cart.quantity",
                    
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "ProductId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        ]);

        const grandTotal = req.session.grandTotal;

        res.render("user/checkout", { data: data, user: findUser, isCart: true, userAddress: userAddress, isSingle: false, grandTotal: grandTotal });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};



module.exports={
    checkoutPageGET,
}