const mongoose= require("mongoose");

const productSchema= new mongoose.Schema({
    productName:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    regularPrice:{
        type: Number,
        required: true,
    },
    salePrice:{
        type: Number,
        required: true
    },
    size:{
        type: String,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    resolution:{
        type: String,
        required: true
    },
    productImage:{
        type: Array,
        required: true
    },
    // isBlocked:{
    //     type: Boolean,
    //     required: true
    // }

})

const Product=mongoose.model("Product",productSchema)

module.exports=Product;