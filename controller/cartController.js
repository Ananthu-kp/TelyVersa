const Product=require("../model/productModel")
const User=require("../model/userModel")
const mongodb = require('mongodb');


const cartPageGet=async(req,res)=>{
    try {
        const email = req.session.user
        const user = await User.findOne({ email: email })
        console.log(user);
        const productId = user.cart.map(item => item.ProductId)
        
        const oid = new mongodb.ObjectId(user._id);

        let product = await User.aggregate([
            { $match: { _id: oid } },
            { $unwind: '$cart' },
            {
                $project: {
                    ProductId: { '$toObjectId': '$cart.ProductId' },
                    quantity: '$cart.quantity',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'ProductId',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            },

        ])
        console.log("Cart Data  =>>", product)


        let quantity = 0
        let grandTotal = 0;


        for (let i = 0; i < product.length; i++) {

            if(product[i].productDetails && product[i].productDetails.length > 0){
                quantity += product[i].quantity
                grandTotal += product[i].productDetails[0].salePrice * product[i].quantity
            } 
            }
            req.session.grandTotal = grandTotal;

        res.render("user/cart", {
            user,
            quantity,
            product,
            grandTotal
        })

    } catch (err) {
        console.log(err)
        res.send("Error")
    }
}


const addToCart = async (req, res) => {
    try {
        const { id, quantity } = req.body;
        const userEmail = req.session.user;
        console.log(userEmail);
        // Check if the user is logged in
        // if (!userId) {
        //     // If user is not logged in, return an error response
        //     return res.json({ err: true, message: "User is not logged in" });
        // }

        const userData = await User.findOne({email:userEmail});
        const productData = await Product.findById(id);

        const salePrice = parseInt(productData.salePrice);
        console.log(salePrice);
        if (productData.quantity > 0) {
                const existingProduct = userData.cart.find(product => product.ProductId === id);
                
                if (!existingProduct) {
                    await User.findByIdAndUpdate(
                        userData._id,
                        {
                            $push: {
                                cart: {
                                    ProductId: id,
                                    quantity: parseInt(quantity), 
                                    price: salePrice
                                }
                            }
                        }
                    );
                    
                    return res.json({ added: true});
                } else {
                    const existingQuantity= parseInt(existingProduct.quantity)
                    await User.findOneAndUpdate(
                        { _id: userData._id, "cart.ProductId": id }, 
                        { 
                            $set: { 
                                "cart.$.quantity": existingQuantity+1, 
                                "cart.$.price": salePrice  
                            }
                        }, 
                        { new: true } 
                    );
                    
                    return res.json({ added: true });
                }
        } else {
            return res.json({ added: false });
        }
    } catch (error) {
        console.log(error);
    }
}



module.exports={
    cartPageGet,
    addToCart,
}