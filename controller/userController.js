const User=require("../model/userModel")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer");
const Product=require("../model/productModel")
const Category=require("../model/categoryModel")
const {v4: uuidv4}= require("uuid")


const userHomeGet=async(req,res)=>{
    try{
        const user=req.session.user
        const product= await Product.find({isBlocked:false})
        if(user){
            const findUser= await User.findOne({email:user})

            const cartCount= findUser.cart.length
            const wishlistCount= findUser.wishlist.length

            res.render("user/userHome", {user : user ,product:product, cartCount,wishlistCount});
        }else{
            res.render("user/userHome", {user : user ,product:product});
        }
       
    }catch(error){
        console.log(error);
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
       
            const hashedPassword = await bcrypt.hash(password, 10);
        

             // Store user data in the session
             req.session.userData = {
                username: username,
                email: email,
                phone: phone,
                password: hashedPassword,
                otp: otp,
            };

            return res.redirect("/otp");
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
    
    try{
        let otpFromAjax=req.body.otp
        const {username,email,phone,password,otp}=req.session.userData;
        // console.log(phone,"phone........");
        console.log(otp,otpFromAjax);

        
        if(otpFromAjax===otp){
            const referalCode= uuidv4()
            const newUser=new User({
                name: username,
                email: email,
                phone: phone,
                password: password,
                referalCode:referalCode,
                createdOn:Date.now()
            });

            await newUser.save();
            res.json({status:true})

            delete req.session.userData

        }else{
            console.log("otp invalid");
            res.json({status:false})
        }
    }catch(error){
        console.log(error.message);
    }
};



const resendOTP = async(req,res)=>{
    try {
        const { email } = req.session.userData;
        console.log(email);

        const newotp = generateOTP()
        req.session.userData.otp = newotp
        console.log(newotp);

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
            text: `Your Resend OTP for registration is: ${newotp}`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error("Error sending email: " + error.message);
                return res.status(500).send("Error sending OTP email");
            }
            console.log("Email sent: " + info.response);

            res.redirect("/otp")
        })
    } catch (error) {
        res.render("user/otp")
    }
}




const verifyUser = async (req, res) => {
    
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email: email });

        if (!findUser) {
            console.log("User not found");
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Check if the user is blocked by the admin
        if (findUser.isBlocked) {
            console.log("User account is blocked by admin");
            res.render("user/userLogin", { login_err: "User is blocked by admin" })

            return;
        }

        const passMatch = await bcrypt.compare(password, findUser.password);
        // console.log(passMatch);
        if (passMatch) {
            console.log("Login successful. Password matched.");

            req.session.user = findUser.email;
            console.log(findUser);

            if(req.session.user){
                res.redirect("/")
            }
        } else {
            console.log("Password doesn't match");
            res.render("user/userLogin", { login_err: "invalid credential" })
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


const pageError = async (req, res) => {
    try {
        res.render("user/404")
    } catch (error) {
        console.log(error.message);
    }
}






//forgotPassword

const forgotPasswordGet = async(req,res)=>{
    try {
        res.render("user/forgotPassword")
    } catch (error) {
        console.log(error.message);
    }
} 




const forgotEmailVerify = async (req,res)=>{
    try {
        const { email } = req.body
        req.session.forgotemail = email
        const existed = await User.findOne({ email })
        if(existed){
            const otp = generateOTP()

            req.session.userData = {
                otp
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_ID,
                  pass: process.env.EMAIL_PASS
                }
              });
    
    
            // Set Email options
    
            const mailOption = {
                from: process.env.EMAIL_ID,
                to: email,
                subject: "OTP Verification",
                text: `Your OTP for forgotPassword Verification is ${otp}`
            }
    
            // Sending email
    
            transporter.sendMail(mailOption, (error,info)=>{
    
                if(error){
                    console.error("Mailing error",error);
                }else{
                    console.log('Email sent: ' + info.response);
                }
                // console.log(otp);
                res.redirect("/forgotOtp")
            })
            
        }else{
            res.render("user/forgotPassword", { message: "User with this email not exists" })
        }
    }catch{
        console.log(error.message);
    }
}


const forgotGet = async (req,res)=>{
    try {
        res.render("user/forgotEmailVerify")
    } catch (error) {
        console.log(error.message);
    }
}


const forgotOtpVerify = async (req,res)=>{
    try{

    let otpfromAjax = req.body.otp
        const {otp} = req.session.userData
        
        if(otpfromAjax == otp){
            console.log("otp matched");
    
            res.json({status : true})
            delete req.session.userData
        }else{
            console.log("otp invalid");
            res.json({status : false})
        }
    } catch (error) {
       console.log(error.message);
    }
}


const  newPasswordGet = async (req,res)=>{
    try {
        res.render("user/newPassword")
    } catch (error) {
        console.log(error.message);
    }
}

const newPassword = async (req, res) => {
    try {
        const { password: newPass1, confirmpassword: newPass2 } = req.body;
        const email = req.session.forgotemail;

        if (!newPass1 || !newPass2) {
            console.error('New password fields are empty');
            return res.render("rePassword", { message: "New password fields cannot be empty" });
        }

        if (newPass1 !== newPass2) {
            console.error('Passwords do not match');
            return res.render("rePassword", { message: "Passwords do not match" });
        }

        const passwordHash = await bcrypt.hash(newPass1, 10);
        console.log('Password Hash:', passwordHash);

        await User.updateOne(
            { email: email },
            {
                $set: {
                    password: passwordHash
                }
            }
        );

        console.log('Password updated successfully');
        res.redirect("/login");
    } catch(error) {
        console.error('Error:', error.message);
        res.render("rePassword", { message: "An error occurred" });
    }
}







//product details

const productDetailsGet= async(req,res)=>{
    try {
        const user = req.session.user
        console.log(user);
        const productId = req.query.id
        console.log(productId);
        const findProduct = await Product.findOne({ _id: productId });
        const findCategory = await Category.findOne({name : findProduct.category})
        const product =await Product.find({})
        console.log(findProduct._id);

        let offers=0;
        if (findProduct.productOffer && findCategory.categoryOffer) {
            offers = findProduct.productOffer + findCategory.categoryOffer;
        } else if (findProduct.productOffer) {
            offers = findProduct.productOffer;
        } else if (findCategory.categoryOffer) {
            offers = findCategory.categoryOffer;
        }

        if (user) {
            const findUser= await User.findOne({email:user})

            const cartCount= findUser.cart.length
            const wishlistCount= findUser.wishlist.length
            res.render("user/productDetails", { product: findProduct, user: user, cartCount ,wishlistCount ,offers})
        } 
        else {
            res.render("user/productDetails", { product: findProduct ,offers})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getShop = async (req, res) => {
    try {
        const user = req.session.user;
        const count = await Product.countDocuments({ isBlocked: false });
        const product = await Product.find({ isBlocked: false });
        const category = await Category.find({ isListed: true }); // Corrected here
        console.log(product);
        if(user){
            const findUser= await User.findOne({email:user})
            const cartCount= findUser.cart.length
            const wishlistCount= findUser.wishlist.length

            res.render("user/userShop", { product, user, count, category ,cartCount,wishlistCount});
        }else{
            res.render("user/userShop", { product, user, count, category });
        }

    } catch (error) {
        console.log(error.message);
    }
};

 //search

 const searchProducts = async (req, res) => {
    try {
        const user = req.session.user
        let search = req.query.search
        const categories = await Category.find({ isListed: true })

        const searchResult = await Product.find({
            $or: [
                {
                    productName: { $regex: ".*" + search + ".*", $options: "i" },
                }
            ],
            isBlocked: false,
        }).lean()

        if(user){
            const findUser= await User.findOne({email:user})
            const cartCount=findUser.cart.length
            const wishlistCount= findUser.wishlist.length

            res.render("user/userShop",
            {
                user: user,
                product: searchResult,
                category: categories,
                cartCount,
                wishlistCount
            })
        }else{
            res.render("user/userShop",
            {
                user: user,
                product: searchResult,
                category: categories,
            })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const filterProduct = async (req, res) => {
    try {
        const user = req.session.user;
        const category = req.query.category;
        const findCategory = category ? await Category.findOne({ _id: category }) : null;

        const query = {
            isBlocked: false,
        };
        if (findCategory) {
            query.category = findCategory.name;
        }
        const findProducts = await Product.find(query);
        const categories = await Category.find({ isListed: true });

        if(user){
            const findUser= await User.findOne({email:user});

            const cartCount= findUser.cart.length
            const wishlistCount= findUser.wishlist.length

            res.render("user/userShop", {
                user: user,
                product: findProducts,
                category: categories,
                selectedCategory: category || null,   
                cartCount,
                wishlistCount
            });
        }else{
            res.render("user/userShop", {
                user: user,
                product: findProducts,
                category: categories,
                selectedCategory: category || null,   
            });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const getSortProducts = async (req, res) => {
    try {
        let option = req.body.option;
        let data;

        if (option == "highToLow") {
            data = await Product.find({ isBlocked: false }).sort({ salePrice: -1 });
        } else if (option == "lowToHigh") {
            data = await Product.find({ isBlocked: false }).sort({ salePrice: 1 });
        } else if (option == "A-Z") {
            data = await Product.find({ isBlocked: false }).sort({ productName: 1 });
        } else if (option == "Z-A"){
            data = await Product.find({ isBlocked: false}).sort({ productName: -1});
        } else if (option == "featured"){
            data= await Product.find({})
        }

        res.json({
            status: true,
            data: {
                currentProduct: data,
            }
        });

    } catch (error) {
        console.log(error.message);
        res.json({ status: false, error: error.message });
    }
};




module.exports={
    userHomeGet,
    userLoginGet,
    userSignupGet,
    insertUser,
    renderOtpPage,
    verifyOtp,
    resendOTP,
    verifyUser,
    logoutUser,
    pageError,
    forgotPasswordGet,
    forgotEmailVerify,
    forgotGet,
    forgotOtpVerify,
    newPasswordGet,
    newPassword,
    productDetailsGet,
    getShop,
    searchProducts,
    filterProduct,
    getSortProducts
}