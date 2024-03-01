const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    product : {
        type : Array,
        required : true
    },
    totalPrice : {
        type : Number,
        required : true
    },
    address : {
        type : Array,
        required : true
    },
    payment : {
        type : String,
        required : true
    },
    userId : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true
    },
    createdOn : {
        type : Date,
        required : true,
    },
    date : {
        type : String,
    },
    discount: {
        type: Number,
        default: 0  
    },
    couponDeduction: {
        type: Number,
        default: 0 
    }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
