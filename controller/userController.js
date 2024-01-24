const User=require("../model/userModel")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer");


const userHomeGet=async(req,res)=>{
        const user  = req.session.user
        if(user){
            res.render("user/userHome", {user : user});
        }else{
            res.render("user/userHome")
        }
}

const userLoginGet=async(req,res)=>{
    if (!req.session.user) {
        res.render("user/userLogin")
    } else {
        res.redirect("/")
    } 
}

const userSignupGet=async(req,res)=>{
    if (!req.session.user) {
        res.render("user/userSignup")
    } else {
        res.redirect("/")
    }
}



//generate otp
const generateOTP = () => {
    const otpLength = 6;
    let otp = '';

    for (let i = 0; i < otpLength; i++) {
        const digit = Math.floor(Math.random() * 10); 
        otp += digit.toString(); 
    }

    return otp;
};



const insertUser=async(req,res)=>{

    const {username, email, phone, password, confirmPassword}=req.body; 
    // console.log(req.body);

    // const trimUsername=username.trim()

    // if(!trimUsername){
    //     console.log("username cannot be with whitespace");
    //     return res.render("user/userSignup")
    // }

    try{
        if(password !== confirmPassword){
            return res.status(404).send({error:"Password doesn't match!!! please try again"})
        }

        const existUser=await User.findOne({email});
        if(existUser){
            console.log("user already exist");
            return res.render("user/userSignup")
        }

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

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error("Error sending email: " + error.message);
                return res.status(500).send("Error sending OTP email");
            }
            console.log("Email sent: " + info.response);
       

             // Store user data in the session
             req.session.userData = {
                username: username,
                email: email,
                phone: phone,
                password: password,
                otp: otp,
            };

            return res.render("user/otp", { email, otp });
        });
    } catch (error) {
        console.error("Error: " + error.message);
        res.status(500).send("Error: " + error.message);
    }
};


const renderOtpPage = async (req, res) => {
        res.render("user/otp")
    
}



const verifyOtp= async (req,res)=>{
    
    const userData = req.session.userData;

    if (!userData) {
        return res.redirect('/signup');
    }

    const submittedOtp = req.body.otp;
    console.log(req.session.userData.password);

    if (!submittedOtp || submittedOtp !== userData.otp.toString()) {
        return res.render("user/otp", { error: 'Incorrect OTP. Please try again.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = new User({
            name: userData.username,
            email: userData.email,
            phone: userData.phone,
            password: hashedPassword,
        });
        
        const result = await user.save();
        console.log(result);
        console.log("Successfully registered");

        // Clear the user data from the session
        delete req.session.userData;

        return res.render("user/userHome");

    } catch (error) {
        console.error("Error: " + error.message);
        res.status(500).send("Error: " + error.message);
    }
};




const verifyUser = async (req, res) => {
    
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email: email });

        if (!findUser) {
            console.log("User not found");
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const passMatch = await bcrypt.compare(password, findUser.password);
        // console.log(passMatch);
        if (passMatch) {
            console.log("Login successful. Password matched.");

            req.session.user = findUser;
            console.log(findUser);

            if(req.session.user){
                res.redirect("/")
            }
        } else {
            console.log("Password doesn't match");
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).send('Login failed. Please try again later.');
    }
};

const logoutUser = async(req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout Error");
            }
            console.log("Logout Successfully");
            res.redirect("/login")
        })
    } catch (error) {
        console.log("Logout Error : ", error);
    }
};
 

module.exports={
    userHomeGet,
    userLoginGet,
    userSignupGet,
    insertUser,
    renderOtpPage,
    verifyOtp,
    verifyUser,
    logoutUser
}