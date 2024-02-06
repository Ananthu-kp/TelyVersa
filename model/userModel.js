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
    }
   
})

const User = mongoose.model('User', userSchema);

module.exports = User;