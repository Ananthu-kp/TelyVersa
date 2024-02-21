const User=require("../model/userModel")
const Product=require("../model/productModel")
const Address=require("../model/addressModel")
const Order=require("../model/orderModel")
const { ObjectId } = require('mongoose');
const bcrypt=require("bcrypt")




const profileGET = async (req, res) => {
    try {
        console.log(req.session.user);
        const userEmail = req.session.user; 
        const userData = await User.findOne({ email: userEmail });
        const addressData = await Address.findOne({ userId: userData._id });
        // console.log("this is address ",addressData);
        const cartCount = userData.cart.length;
        const wishlistCount = userData.wishlist.length

        const page = parseInt(req.query.page) || 1;
        const perPage = 4;

        const totalOrders = await Order.countDocuments({});
        const totalPages = Math.ceil(totalOrders / perPage);

        const orderData = await Order.find({ userId: userEmail }).sort({ createdOn: -1 })
                .skip((page-1)* perPage)
                .limit(perPage)

        console.log("this is my order data",orderData);
        res.render("user/profile", { user: userData, userAddress: addressData, order: orderData ,currentPage: page,totalPages ,cartCount, wishlistCount});

    } catch (error) {
        console.log(error.message);
    }
}


const editUserDetails = async (req, res) => {
    try {
        const userId = req.query.id
        const data = req.body
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    name: data.name,
                    phone: data.phone
                    // email: data.email,
                }
            }
        )
            .then((data) => console.log(data))
        res.redirect("/profile")

    } catch (error) {
        console.log(error.message);
    }
}

const addAddressGET = async (req, res) => {
    try {
        const user = req.session.user
        const findUser= await User.findOne({email:user})
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length
        res.render("user/address", { user: user , cartCount, wishlistCount})
    } catch (error) {
        console.log(error.message);
    }
}


const addAddress = async (req, res) => {
    try {
        const user = req.session.user
        console.log(user);
        const userData = await User.findOne({ email: user })
        const {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone,
        } = req.body;
        const userAddress = await Address.findOne({ userId: userData._id })
        if (!userAddress) {
            console.log("fst");
            console.log(userData._id);
            const newAddress = new Address({
                userId: userData._id,
                address: [
                    {
                        addressType,
                        name,
                        city,
                        landMark,
                        state,
                        pincode,
                        phone,
                        altPhone,
                    },
                ]
            })
            await newAddress.save()
        } else {
            console.log("ok");
            userAddress.address.push({
                addressType,
                name,
                city,
                landMark,
                state,
                pincode,
                phone,
                altPhone,
            })
            await userAddress.save()
        }

        res.redirect("/profile")

    } catch (error) {
        console.log(error.message);
    }
}

const editAddressGET = async (req, res) => {
    try {
        const addressId = req.query.id
        const user = req.session.user
        const findUser= await User.findOne({email:user})
        const currAddress = await Address.findOne({
            "address._id": addressId,
        });
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length

        const addressData = currAddress.address.find((item) => {
            return item._id.toString() == addressId.toString()
        })
        // console.log(addressData);
        res.render("user/edit-address", { address: addressData, user: user ,cartCount, wishlistCount})
    } catch (error) {
        console.log(error.message);
    }
}


const editAddress = async (req, res) => {
    try {
        console.log(req.body);
        const data = req.body
        const addressId = req.query.id

        console.log(addressId, "address id")
        const user = req.session.user
        const findAddress = await Address.findOne({ "address._id": addressId });
        const matchedAddress = findAddress.address.find(item => item._id == addressId)
        console.log(matchedAddress);
        await Address.updateOne(
            {
                "address._id": addressId,
                "_id": findAddress._id,
            },
            {
                $set: {
                    "address.$": {
                        _id: addressId,
                        addressType: data.addressType,
                        name: data.name,
                        city: data.city,
                        landMark: data.landMark,
                        state: data.state,
                        pincode: data.pincode,
                        phone: data.phone,
                        altPhone: data.altPhone,
                    },
                }
            }
        ).then((result) => {

            res.redirect("/profile")
        })
    } catch (error) {
        console.log(error.message);
    }
}


const deleteAddressGET = async (req, res) => {
    try {

        const addressId = req.query.id
        const findAddress = await Address.findOne({ "address._id": addressId })
        await Address.updateOne(
            { "address._id": addressId },
            {
                $pull: {
                    address: {
                        _id: addressId
                    }
                }
            }
        )
            .then((data) => res.redirect("/profile")
            )
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetails=async(req,res)=>{
    try{
        const userEmail=req.session.user;
        const orderId=req.query.id;
    
        const findOrder= await Order.findOne({_id: orderId});
        const findUser= await User.findOne({email: userEmail});
        // console.log(findOrder,findUser);
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length

        res.render("user/orderDetails", { orders: findOrder, orderId , user:findUser, cartCount, wishlistCount})

    }catch(error){
        console.log(error);
    }
}

const verifyOldPassword = async (req, res) => {
    try {
        const { oldPass } = req.body;
        const userEmail = req.session.user;

        const findUser = await User.findOne({ email: userEmail });
        const passwordMatch = await bcrypt.compare(oldPass, findUser.password);
        if (!passwordMatch) {
            return res.json({ status: false, error: "Old password does not match" });
        }
        return res.json({ status: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: false, error: "Internal server error" });
    }
}


const changePassword = async (req, res) => {
    try {
        const { oldPass, newPass } = req.body;
        const userEmail = req.session.user;

        const findUser = await User.findOne({ email: userEmail });
        if (!findUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(oldPass, findUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Old password does not match" });
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);
        await User.updateOne({ email: userEmail }, { $set: { password: hashedPassword }});

        console.log('Password changed successfully.');
        res.json({ status: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports={
    profileGET,
    editUserDetails,
    addAddressGET,
    addAddress,
    editAddressGET,
    editAddress,
    deleteAddressGET,
    orderDetails,
    verifyOldPassword,
    changePassword
}