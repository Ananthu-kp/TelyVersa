const User=require("../model/userModel")
const Product=require("../model/productModel")
const Address=require("../model/addressModel")
const Order=require("../model/orderModel")
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


const placeOrder = async (req, res) => {
    try {
        console.log("hi");
        const { grandTotal, addressId, payment, productId } = req.body;
        const userId = req.session.user;
        console.log("this is the proId",productId);
        const findUser = await User.findOne({ email: userId });
        const findAddress = await Address.findOne({ 'address._id': addressId });
        const desiredAddress = findAddress.address.find(item => item._id.toString() === addressId.toString());
        const products = await Product.find({ _id: { $in: productId } });
        console.log(products);

        const cartItemUnit = findUser.cart.map((item) => ({
            ProductId: item.ProductId,
            quantity: item.quantity
        }));
        console.log("this is the cart item",cartItemUnit);

        const orderedProducts = products.map((item) => ({
            _id: item._id,
            price: item.salePrice,
            name: item.productName,
            images: item.productImage[0],
            quantity: cartItemUnit.find(cartItem => cartItem.ProductId.toString() === item._id.toString()).quantity
        }));

        console.log("this is the ordered item",orderedProducts);

        
        const totalPrice = orderedProducts.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);

        const newOrder = new Order({
            product: orderedProducts,
            totalPrice: totalPrice,
            grandTotal: grandTotal,
            address: desiredAddress,
            payment: payment,
            userId: userId,
            status: "Confirmed",
            createdOn: Date.now()
        });

        await User.updateOne(
            { email: userId },
            { $set: { cart: [] } }
        );

        for (let i = 0; i < orderedProducts.length; i++) {
            const product = await Product.findOne({ _id: orderedProducts[i]._id });
            if (product) {
                const newUnit = Math.max(product.quantity - orderedProducts[i].quantity, 0);
                product.quantity = newUnit;
                await product.save();
            }
        }

        let orderDone;
        if (newOrder.payment === 'cod') {
            console.log('order placed by cod');
            orderDone = await newOrder.save();
            return res.json({ payment: true, method: "cod", order: orderDone, quantity: cartItemUnit, orderId: findUser });
        } 
        
        // Handle other payment methods if needed

    } catch (error) {
        console.error('Error fetching products:', error);
        console.log(error.message);
        // Send an appropriate error response to the client
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const cancelOrder=async(req,res)=>{
    try{
        const orderId = req.query.orderId.trim();
        const order = await Order.findById(orderId);
        for (const product of order.product) {
            
            const productId = product._id;
            const quantity = product.quantity;

            await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } });
            console.log(`Increasing quantity for product ${productId} by ${quantity}`);
        }
        await Order.updateOne({ _id: orderId },
            { status: "Canceled" }
        ).then((data) => console.log(data))

        res.redirect('/profile');

    }catch(error){

    }
}


//admin side

const orderList=async(req,res)=>{
    try{
        const orders = await Order.find({}).sort({ createdOn: -1 });
        console.log(orders);
        res.render("admin/orderList",{orders})
    }catch(error){
        console.log(error);
    }
}

const orderDetails=async(req,res)=>{
    try{
        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId }).sort({ createdOn: 1 })
        console.log(findOrder);


        res.render("admin/orderDetails", { orders: findOrder, orderId })
    }catch(error){

    }
}

const changeOrderStatus = async (req, res) => {
    try {
        console.log(req.query);

        const orderId = req.query.orderId.trim(); 
        console.log(orderId);

        await Order.updateOne({ _id: orderId },
            { status: req.query.status }
        ).then((data) => console.log(data))
        
        res.redirect('/admin/orderList');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    checkoutPageGET,
    placeOrder,
    cancelOrder,
    orderList,
    orderDetails,
    changeOrderStatus
}