const Admin =require("../model/adminModel")
const bcrypt=require("bcrypt")
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const Category = require("../model/categoryModel");

const adminLoginGet=async(req,res)=>{
    if(req.session.admin){
        res.redirect("/admin")
    }else{
        res.render("admin/adminLogin")
    }
    
}


const adminVerify = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        console.log(password);

        const findAdmin = await Admin.findOne({ email: email });
        req.session.admin = findAdmin.email;    

        if (!findAdmin) {
            res.redirect("/admin/login");
        } else {
            if(findAdmin.password==password){
                res.redirect("/admin");
            }else {
               
                 res.redirect("/admin/login");
            }
        }
    } catch (error) {
        console.error(error);
    }
};



const adminHomeGet=async(req,res)=>{
    try {
        const user = await User.find({})
        const product = await Product.find({})
        const category = await Category.find({isListed:true})
        const order = await Order.find({status:"Delivered"})

        const productCount= product.length
        const orderCount= order.length
        const categoryCount= category.length

        const totalRevenue= calculateTotalRevenue(order)
        const monthlyOrders= await getMonthlyOrders();
        const monthlyEarnings= calculateMonthlyEarnings(monthlyOrders);
        const monthlySales= await getMonthlySales();

        const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySales.find(item => item._id === index + 1);
            return monthData ? monthData.count : 0;
        });
        const latestOrders = await Order.find().sort({ createdOn: -1 }).limit(5);

        const productPerMonth = Array(12).fill(0);
        product.forEach(p => {
            const createdOnDate = new Date(p.createdOn);
            const createdMonth = createdOnDate.getMonth();
            productPerMonth[createdMonth]++;
        });

        const userPerMonth = Array(12).fill(0);
        user.forEach(u => {
            const createdOnDate = new Date(u.createdOn);
            const createdMonth = createdOnDate.getMonth();
            userPerMonth[createdMonth]++;
        });

        const top5BestSellingProducts = await calculateTopSellingProducts();
        console.log("Top 5 Best Selling Products:", top5BestSellingProducts);
        const topSellingCategories = await calculateTopSellingCategories();
        console.log("Top 5 Best Selling Products:", topSellingCategories);

        res.render("admin/adminHome",{
            totalRevenue, 
            orderCount,
            productCount,
            categoryCount,
            monthlyEarnings, 
            monthlySalesArray, 
            productPerMonth, 
            latestOrders,
            userPerMonth,
            top5BestSellingProducts,
            topSellingCategories: topSellingCategories, 
            dashboard:true})

    } catch (error) {
        console.log(error);
    } 
}
const calculateTopSellingCategories = async () => {
    try {
        const topSellingCategories = await Order.aggregate([
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product._id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalQuantitySold: { $sum: "$product.quantity" }
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            },
            {
                $limit: 5
            }
        ]);

        return topSellingCategories;
    } catch (error) {
        console.error("Error calculating top selling categories:", error);
        return []; // Return an empty array in case of error
    }
};


const calculateTotalRevenue = (order) => {
    let totalRevenue = 0;
    for (let i in order) {
        totalRevenue += order[i].totalPrice;
    }
    return totalRevenue;
};

const getMonthlyOrders = async () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return await Order.find({
        status: "Delivered",
        createdOn: {
            $gte: firstDayOfMonth,
            $lt: lastDayOfMonth
        }
    });
};

const calculateMonthlyEarnings = (monthlyOrders) => {
    let monthlyEarnings = 0;
    for (let i in monthlyOrders) {
        monthlyEarnings += monthlyOrders[i].totalPrice;
    }
    return monthlyEarnings;
};

const getMonthlySales = async () => {
    return await Order.aggregate([
        {
            $match: {
                status: "Delivered"
            }
        },
        {
            $group: {
                _id: {
                    $month: '$createdOn',
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id': 1
            }
        }
    ]);
};

const calculateTopSellingProducts = async () => {
    const orders = await Order.aggregate([
        {
            $match: { status: "Delivered" }
        },
        {
            $unwind: "$product"
        },
        {
            $group: {
                _id: { productId: "$product._id", productName: "$product.productName" },
                totalQuantitySold: { $sum: { $toInt: "$product.quantity" } }
            }
        },
        {
            $sort: { totalQuantitySold: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "products",
                localField: "_id.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                _id: "$product._id",
                productName: "$product.productName",
                productImage: "$product.productImage",
                salePrice: "$product.salePrice",
                regularPrice: "$product.regularPrice",
                totalQuantitySold: 1
            }
        }
    ]);

    return orders;
};

const adminLogout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect("/admin/login")
    } catch (error) {
        console.log(error.message);
    }
};

  


module.exports={
    adminHomeGet,
    adminLoginGet,
    adminVerify,
    adminLogout
    
}