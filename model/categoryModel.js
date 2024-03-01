const mongoose = require("mongoose")

const categorySchema =  mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true
    },
    isListed : {
        type : Boolean,
        default : true
    },
    categoryOffer : {
        type : Number,
        default : 0
    }
})

const Category = mongoose.model("Category", categorySchema)

module.exports = Category