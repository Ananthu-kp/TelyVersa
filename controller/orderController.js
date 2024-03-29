const User = require("../model/userModel")
const Product = require("../model/productModel")
const Address = require("../model/addressModel")
const Order = require("../model/orderModel")
const Coupon = require("../model/couponModel")
const mongodb = require('mongodb');
const razorpay = require("razorpay")
const crypto = require("crypto")
const Category=require("../model/categoryModel")

let instance = new razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
})



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

        const today = new Date().toISOString()

        const findCoupon = await Coupon.find({
            isList: true,
            createdOn: { $lt: new Date(today) },
            expireOn: { $gt: new Date(today) },
            minimumPrice: { $lt: grandTotal },
        })

        console.log("Coupon data : ", findCoupon);

        const cartCount = findUser.cart.length
        const wishlistCount = findUser.wishlist.length

        const shipping=40;

        res.render("user/checkout", { data: data, user: findUser, isCart: true, userAddress: userAddress, isSingle: false, grandTotal: grandTotal, cartCount, wishlistCount, coupons: findCoupon ,shipping});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user;
        const code = req.body.code;
        let grandTotal = req.session.grandTotal;

        const selectedCoupon = await Coupon.findOne({ name: code });

        if (!selectedCoupon) {
            return res.json({ status: false });
        } else if (selectedCoupon.userId.includes(userId)) {
            return res.json({ used: true });
        } else {

            const newGrandTotal = grandTotal - parseInt(selectedCoupon.offerPrice);
            // console.log(newGrandTotal);
            req.session.grandTotal = newGrandTotal;

            await Coupon.updateOne(
                { name: code },
                { $addToSet: { userId: userId } }
            );
            return res.json({ status: true, total: newGrandTotal, discount: parseInt(selectedCoupon.offerPrice) });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const placeOrder = async (req, res) => {
    try {
        console.log("hi");
        const { totalPrice, addressId, payment, productId ,couponDiscount} = req.body;
        const userId = req.session.user;
        console.log(req.session.grandTotal, "from session");
        const grandTotal = req.session.grandTotal
        console.log("this is the proId", productId);
        const findUser = await User.findOne({ email: userId });
        const findAddress = await Address.findOne({ 'address._id': addressId });
        const desiredAddress = findAddress.address.find(item => item._id.toString() === addressId.toString());
        const products = await Product.find({ _id: { $in: productId } });
        const category= await Category.find({_id:{$in:productId}})
        // console.log(products);

        const cartItemUnit = findUser.cart.map((item) => ({
            ProductId: item.ProductId,
            quantity: item.quantity
        }));
        console.log("this is the cart item", cartItemUnit);

        const orderedProducts = products.map((item) => ({
            _id: item._id,
            price: item.salePrice,
            name: item.productName,
            images: item.productImage[0],
            category:item.category,
            quantity: cartItemUnit.find(cartItem => cartItem.ProductId.toString() === item._id.toString()).quantity
        }));

        console.log("this is the ordered item", orderedProducts);


        const totalprice = orderedProducts.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);

        const shipping=40;

        const newOrder = new Order({
            product: orderedProducts,
            totalPrice: grandTotal,
            address: desiredAddress,
            payment: payment,
            userId: userId,
            status: "Confirmed",
            createdOn: Date.now(),
            couponDeduction:couponDiscount,
            shipping:shipping
        });

        const newOrderFromRazorpay = new Order({
            product: orderedProducts,
            totalPrice: grandTotal,
            address: desiredAddress,
            payment: payment,
            userId: userId,
            status: "Pending",
            createdOn: Date.now(),
            couponDeduction:couponDiscount,
            shipping:shipping
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

        } else if (newOrder.payment === 'online') {
            console.log("orderplaced with razorpay");
            orderDone = await newOrderFromRazorpay.save();
            const generateOrder = await generateOrderRazorpay(orderDone._id, orderDone.totalPrice)
            console.log(generateOrder, "order generated");
            res.json({ payment: false, method: "online", order: orderDone, razorpayOrder: generateOrder, orderId: orderDone._id, quantity: cartItemUnit })

        } else if (newOrder.payment==='wallet') {
            if(newOrder.totalPrice <= findUser.wallet){
                console.log("orderPlaced with wallet");
                findUser.wallet -= newOrder.totalPrice;
                // const data= findUser.wallet - newOrder.totalPrice
                

                const newHistory={
                    amount:newOrder.totalPrice,
                    status:"debit",
                    date:Date.now()
                }

                const orderDone = await newOrder.save();

                console.log(newHistory);
                findUser.history.push(newHistory)
                await findUser.save()

                res.json({payment:true, method:"wallet", order:orderDone, orderId: findUser, quantity: cartItemUnit, success:true})
                return;
            }else{
                console.log("wallet amount is not enough to buy this product");
                res.json({payment:false, method:"wallet", success:false})
                return;
            }
        }
        
       
        // Handle other payment methods if needed

    } catch (error) {
        console.error('Error fetching products:', error);
        console.log(error.message);
        // Send an appropriate error response to the client
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const generateOrderRazorpay = (orderId, total) => {
    console.log(orderId, total, "generateOrderRazorpay");
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
}


const verify = (req, res) => {
    console.log(req.body, "end");
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
    hmac.update(
        `${req.body.payment.razorpay_order_id}|${req.body.payment.razorpay_payment_id}`
    );
    hmac = hmac.digest("hex");
    // console.log(hmac,"HMAC");
    // console.log(req.body.payment.razorpay_signature,"signature");
    if (hmac === req.body.payment.razorpay_signature) {
        console.log("true");
        changeOrderStatusToConfirmed(req.body.orderId)
        res.json({ status: true });
    } else {
        console.log("false");
        res.json({ status: false });
    }
};

const changeOrderStatusToConfirmed = async (orderId) => {
    await Order.updateOne(
        { _id: orderId },
        { status: "Confirmed" }
    )
        .then(res => console.log(res))
}

const continuePayment = async (req, res) => {
    try {
        const { orderId } = req.body
        const userId = req.session.user
        const findUser = await User.findOne({ email: userId })
        const findOrder = await Order.findOne({ _id: orderId })
        console.log("ContinuePayment ", findOrder);


        const cartItemUnit = findUser.cart.map((item) => ({
            productId: item.ProductId,
            quantity: item.quantity
        }))


        const generatedOrder = await generateOrderRazorpay(orderId, findOrder.totalPrice);
        console.log(generatedOrder, "order generated");

        res.json(
            {
                payment: false,
                method: "online",
                razorpayOrder: generatedOrder,
                order: findOrder,
                orderId: orderId,
                quantity: cartItemUnit,

            })

    } catch (error) {
        console.log(error.message);
    }
}


const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId.trim();
        const order = await Order.findById(orderId);
        for (const product of order.product) {

            const productId = product._id;
            const quantity = product.quantity;

            await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } });
            console.log(`Increasing quantity for product ${productId} by ${quantity}`);
        }

        if(order.payment !=="cod"){
            const totalAmount = order.totalPrice;
            const findUser = await User.findOne({ email: order.userId });
            findUser.wallet += totalAmount;
            
            const refundHistory = {
                amount: totalAmount,
                status: "credit",
                date: Date.now()
            };
    
            findUser.history.push(refundHistory);
            await findUser.save();
        }

        await Order.updateOne({ _id: orderId },
            { status: "Canceled" }
        ).then((data) => console.log(data))

        res.redirect('/profile');

    } catch (error) {
        console.log(error);
    }
}


const returnProduct = async (req, res) => {
    try {
        const userId = req.session.user
        const findUser = await User.findOne({ email: userId })

        const id = req.query.id
        await Order.updateOne({ _id: id },
            { status: "Returned" }
        ).then((data) => console.log(data))

        const findOrder = await Order.findOne({ _id: id })


        if (findOrder.payment !=="cod") {
            findUser.wallet += findOrder.totalPrice;

            const newHistory = {
                amount: findOrder.totalPrice,
                status: "credit",
                date: Date.now()
            }
            findUser.history.push(newHistory)
            await findUser.save();
        }

        for (const productData of findOrder.product) {
            const productId = productData.ProductId;
            const quantity = productData.quantity;

            const product = await Product.findById(productId);


            if (product) {
                product.quantity += quantity;
                await product.save();
            }
        }

        res.redirect('/profile');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};




//admin side

const orderList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the current page from query parameters, default to 1 if not provided
        const perPage = 4; // Number of orders per page

        const totalOrders = await Order.countDocuments({});
        const totalPages = Math.ceil(totalOrders / perPage);

        const orders = await Order.find({})
            .sort({ createdOn: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render("admin/orderList", { orders, currentPage: page, totalPages, orderList: true });
    } catch (error) {
        console.log(error);
    }
}


const orderDetails = async (req, res) => {
    try {
        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId }).sort({ createdOn: 1 })
        console.log(findOrder);


        res.render("admin/orderDetails", { orders: findOrder, orderId })
    } catch (error) {

    }
}

const changeOrderStatus = async (req, res) => {
    try {

        const orderId = req.query.orderId.trim();
        // console.log(orderId);
        const newStatus = req.query.status;
        // console.log(newStatus,"bfjfjhdfhwfh");
        const order = await Order.findById(orderId);


          if(order.newStatus === 'Confirmed' && order.payment !=="cod"){
            const totalAmount = order.totalPrice;
            const findUser = await User.findOne({ email: order.userId });
            findUser.wallet += totalAmount;
            
            const refundHistory = {
                amount: totalAmount,
                status: "credit",
                date: Date.now()
            };
    
            findUser.history.push(refundHistory);
            await findUser.save();
          }
    
        await Order.updateOne({ _id: orderId },
            { status: req.query.status }
        ).then((data) => console.log(data))

        res.redirect('/admin/orderList');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    checkoutPageGET,
    placeOrder,
    cancelOrder,
    applyCoupon,
    verify,
    returnProduct,
    continuePayment,

    orderList,
    orderDetails,
    changeOrderStatus
}