const Product = require("../model/productModel");
const User = require("../model/userModel");
const mongodb = require('mongodb');

const cartPageGet = async (req, res) => {
    try {
        const email = req.session.user;
        const user = await User.findOne({ email });
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
        ]);

        let quantity = 0;
        let grandTotal = 0;

        for (let i = 0; i < product.length; i++) {
            if (product[i].productDetails && product[i].productDetails.length > 0) {
                quantity += product[i].quantity;
                grandTotal += product[i].productDetails[0].salePrice * product[i].quantity;
            }
        }
        req.session.grandTotal = grandTotal;

        const cartCount = user.length
        const wishlistCount = user.wishlist.length

        res.render("user/cart", { user, quantity, product, grandTotal ,cartCount,wishlistCount});
    } catch (err) {
        console.error("Error fetching cart page:", err);
        res.status(500).send("Error fetching cart page");
    }
};

const addToCart = async (req, res) => {
    try {
        const { id, quantity } = req.body;
        const userEmail = req.session.user;
        const userData = await User.findOne({ email: userEmail });
        const productData = await Product.findById(id);
        const salePrice = parseInt(productData.salePrice);

        if (productData.quantity > 0) {
            const existingProduct = userData.cart.find(product => product.ProductId === id);
            if (!existingProduct) {
                await User.findByIdAndUpdate(userData._id, {
                    $push: {
                        cart: {
                            ProductId: id,
                            quantity: parseInt(quantity),
                            price: salePrice
                        }
                    }
                });
                return res.json({ added: true });
            } else {
                const existingQuantity = parseInt(existingProduct.quantity);
                await User.findOneAndUpdate({ _id: userData._id, "cart.ProductId": id },
                    {
                        $set: {
                            "cart.$.quantity": existingQuantity + 1,
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
        console.error("Error adding to cart:", error);
        res.status(500).json({ added: false, message: "Failed to add to cart" });
    }
};

const changeQuantity = async (req, res) => {
    try {
        // console.log("abi");
        const { productId, quantity } = req.body;
        const userEmail = req.session.user;
        const userData = await User.findOne({ email: userEmail });
        const productData = await Product.findById(productId);
        // console.log("productId",productId);
        // console.log("userData",userData);
        // console.log("productData",productData);
        // console.log("quantity",quantity);
        const newone = await User.updateOne(
            { email: userEmail, "cart.ProductId": productId },
            { $set: { "cart.$.quantity": quantity } }
        );

        console.log("new one : ", newone);

        res.json({ success: true });
    } catch (error) {
        console.error("Error changing quantity:", error);
        res.status(500).json({ success: false, message: "Failed to change quantity" });
    }
};



const deleteCartProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const result = await User.updateOne(
            { email: req.session.user },
            {
                $pull: {
                    cart: { ProductId: productId }
                }
            }
        );
        console.log(result);
        res.redirect("/cart");
    } catch (error) {
        console.log('error ', error);
    }
}



module.exports = {
    cartPageGet,
    addToCart,
    changeQuantity,
    deleteCartProduct
};
