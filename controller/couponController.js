const Coupon = require("../model/couponModel")



const getCouponPage = async (req, res) => {
    try {
        const findCoupons = await Coupon.find({})
        res.render("admin/coupon", { coupons: findCoupons ,coupon:true})
    } catch (error) {
        console.log(error.message);
    }
}


const createCoupon = async (req, res) => {
    try {
console.log("hello");
        const data = {
            couponName: req.body.couponName,
            startDate: new Date(req.body.startDate + 'T00:00:00'),
            endDate: new Date(req.body.endDate + 'T00:00:00'),
            offerPrice: parseInt(req.body.offerPrice),
            minimumPrice: parseInt(req.body.minimumPrice)
        };

        const newCoupon = new Coupon({
            name: data.couponName,
            createdOn: data.startDate,
            expireOn: data.endDate,
            offerPrice: data.offerPrice,
            minimumPrice: data.minimumPrice
        })

        await newCoupon.save()
            .then(data => console.log(data))

        res.redirect("/admin/coupon")

        console.log(data);

    } catch (error) {
        console.log(error.message);
    }
}


const deleteCoupon = async (req, res) => {
    try {
        
        const id = req.params.id;
        // console.log(id);
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = {
    getCouponPage,
    createCoupon,
    deleteCoupon
}