const User=require("../model/userModel")
const razorpay = require("razorpay")


let instance = new razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
})


const addMoneyToWallet = async (req, res) => {
    try {
        // console.log(req.body)
        var options = {
            amount: req.body.total * 100,
            currency: "INR",
            receipt: "" + Date.now(),
        };
        console.log("Creating Razorpay order with options:", options);

        instance.orders.create(options, async function (err, order) {
            if (err) {
                console.log("Error while creating order : ", err);
            } else {
                var amount = order.amount / 100;
                console.log(amount);
                await User.updateOne(
                    {
                        email: req.session.user
                    }, {
                    $push: {
                        history: {
                            amount: amount, status: "credit", date: Date.now()
                        }
                    }
                }
                )
            }
            res.json({ order: order, razorpay: true })
        })
    } catch (error) {
        console.log(error.message);
    }
}




const paymentMethod = async (req, res) => {
    try {
        let details = req.body
        console.log(details);
        let amount = parseInt(details.order.order.amount) / 100
        console.log(amount);
        await User.updateOne(
            { email: req.session.user },
            { $inc: { wallet: amount } }
        )
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    addMoneyToWallet,
    paymentMethod
}