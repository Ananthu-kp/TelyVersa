const User=require("../model/userModel")
const bcrypt=require("bcrypt")


const userHomeGet=async(req,res)=>{
    res.render("user/userHome")
}

const userLoginGet=async(req,res)=>{
    res.render("user/userLogin")
}

const userSignupGet=async(req,res)=>{
    res.render("user/userSignup")
}

const insertUser=async(req,res)=>{

    const {username, email, phone, password, confirmPassword}=req.body; 
    // console.log(req.body);

    const trimUsername=username.trim()

    if(!trimUsername){
        res.render("user/userSignup")
        console.log("username cannot be with whitespace");
        return
    }

    try{
        if(password !== confirmPassword){
            return res.status(404).send({error:"Password doesn't match!!! please try again"})
        }

        const hashedPassword=await bcrypt.hash(password, 10);

        const user = new User({
            name : username,
            email : email,
            phone : parseInt(phone),
            password: hashedPassword
        });
       
        
        await user.save()
        .then(result=>{
            console.log(result);
        })
        console.log("successfully register");
        // res.status(200).send("User registered successfully");
        res.render("user/otp")
        
       
    }catch (error){
        res.status(500).send("Error: "+error.message)
    }
};


const verifyOtp = async (req, res) => {
        res.render("user/otp")
    
}

module.exports={
    userHomeGet,
    userLoginGet,
    userSignupGet,
    insertUser,
    verifyOtp
}