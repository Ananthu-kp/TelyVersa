const User=require("../model/userModel")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer");


const userHomeGet=async(req,res)=>{
    res.render("user/userHome")
}

const userLoginGet=async(req,res)=>{
    res.render("user/userLogin")
}

const userSignupGet=async(req,res)=>{
    res.render("user/userSignup")
}



//generate otp
const generateOTP = () => {
    const otpLength = 6;
    let otp = '';

    for (let i = 0; i < otpLength; i++) {
        const digit = Math.floor(Math.random() * 10); // Generate a random digit (0-9)
        otp += digit.toString(); // Append the digit to the OTP string
    }

    return otp;
};


const insertUser=async(req,res)=>{

    const {username, email, phone, password, confirmPassword}=req.body; 
    // console.log(req.body);

    const trimUsername=username.trim()

    if(!trimUsername){
        console.log("username cannot be with whitespace");
        return res.render("user/userSignup")
    }

    try{
        if(password !== confirmPassword){
            return res.status(404).send({error:"Password doesn't match!!! please try again"})
        }

        const existUser=await User.findOne({email});
        if(existUser){
            console.log("user already exist");
            return res.render("user/userSignup")
        }

        const hashedPassword=await bcrypt.hash(password, 10);

        const user = new User({
            name : username,
            email : email,
            phone : phone,
            password: hashedPassword
        });
       
        
        const result= await user.save();
        console.log(result);
        console.log("successfully register");

        const otp = generateOTP();

         // Nodemailer configuration
         const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for registration is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: " + error.message);
                return res.status(500).send("Error sending OTP email");
            }
            console.log("Email sent: " + info.response);
            return res.render("user/otp", { email, otp });
        });
    } catch (error) {
        console.error("Error: " + error.message);
        res.status(500).send("Error: " + error.message);
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