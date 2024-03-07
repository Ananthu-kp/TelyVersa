const mongoose=require('mongoose')


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone: {
        type: Number,
        required: true,
        unique : true
    },
    password:{
        type:String,
        required:true
    },
    isBlocked:{
        type:Number,
        default:0
    },
    cart:{
        type:Array,
    },
    wishlist:{
        type:Array
    },
    wallet:{
        type:Number,
        default: 0
    },
    history: {
        type: Array
    },
    referalCode: {
        type: String,
        required: true,
    },
    redeemed: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: Date
    },
    redeemedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],
   
})

const User = mongoose.model('User', userSchema);

module.exports = User;