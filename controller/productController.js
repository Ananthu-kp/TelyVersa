const Product = require("../model/productModel")
const Category = require("../model/categoryModel")
const fs= require("fs")

const addProductGet = async (req, res) => {
    const category = await Category.find({ isListed: true })
    res.render("admin/adminAddProduct", { category: category, addProduct: true })
}


const productListGet = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perpage = 5;

        const totalProducts = await Product.countDocuments({});
        const totalPages = Math.ceil(totalProducts / perpage);

        const data = await Product.find({})
            .skip((page - 1) * perpage)
            .limit(perpage);

        // console.log(data);
        res.render("admin/adminViewProducts", { data, currentPage: page, totalPages, Products: true });
    } catch (err) {
        console.error("Product Listing error", err);
        res.status(500).send("Internal Server Error");
    }
};


const addProduct = async (req, res) => {
    try {
        const productData = req.body;
        console.log(req.body);
        // const images = req.files;    
        // const productImage = images ? images[0].filename : null;

        // Check if a product with the same name already exists
        const existingProduct = await Product.findOne({ name: productData.productName });

        if (!existingProduct) {
            const productImage = [];

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    productImage.push(req.files[i].filename);
                }
            }

            const newProduct = new Product({
                productName: productData.productName,
                description: productData.description,
                regularPrice: productData.regularPrice,
                salePrice: productData.regularPrice,
                quantity: productData.quantity,
                size: productData.size,
                resolution: productData.resolution,
                category: productData.category,
                productImage: productImage,
                createdOn:Date.now()
            });

            // Save the new product to the database
            await newProduct.save();
            console.log("Product saved successfully");
            res.redirect("/admin/addproduct");
        } else {
            // Product with the same name already exists
            res.json("failed");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const editProductGet = async (req, res) => {
    try {
        const id = req.query.id
        const findProduct = await Product.findOne({ _id: id })
        const category = await Category.find({})
        res.render("admin/editProduct", { product: findProduct, category: category })
    } catch (error) {
        console.log(error.message);
    }
}

const path = require("path")
const deleteSingleImage = async (req, res) => {
    try {
        console.log("hi");
        const id = req.body.productId
        const image = req.body.filename
        console.log(id, image);
        const product = await Product.findByIdAndUpdate(id, {
            $pull: { productImage: image }
        })
        // console.log(image);
        const imagePath = path.join('public', 'uploads', 'products', image);
        if (fs.existsSync(imagePath)) {
            await fs.unlinkSync(imagePath);
            console.log(`Image ${image} deleted successfully`);
            res.json({ success: true })
        } else {
            console.log(`Image ${image} not found`);
        }

        // res.redirect(`/admin/editProduct?id=${product._id}`)

    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const productData = req.body;
        const product = await Product.findById(id);

        const existingImages = product.productImage || []; 
        const newImages = [];

        if (req.files && req.files.length > 0) {
            // Push new image filenames to newImages array
            for (let i = 0; i < req.files.length; i++) {
                newImages.push(req.files[i].filename);
            }
        }
        const updatedImages = [...existingImages, ...newImages];

        const updatedProduct = {
            productName: productData.productName,
            description: productData.description,
            regularPrice: productData.regularPrice,
            salePrice: productData.regularPrice,
            quantity: productData.quantity,
            size: productData.size,
            resolution: productData.resolution,
            category: productData.category,
            productImage: updatedImages,
            createdOn: Date.now()
        };

        await Product.findByIdAndUpdate(id, updatedProduct, { new: true });

        console.log("Product updated");
        res.redirect("/admin/productList");
    } catch (error) {
        console.log(error.message);
    }
};



const blockProduct = async (req, res) => {
    try {
        let id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } })
        console.log("product blocked")
        res.redirect("/admin/productList")
    } catch (error) {
        console.log(error.message);
    }
}

const unblockProduct = async (req, res) => {
    try {
        let id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { isBlocked: false } })
        console.log("product unblocked")
        res.redirect("/admin/productList")
    } catch (error) {
        console.log(error.message);
    }
}


const addProductProductOffer = async (req, res) => {
    try {
       
        const { percentage, productId } = req.body
        // console.log("=>>>>>>>>>>>>", percentage, productId);
        const findProduct = await Product.findOne({_id : productId})
        // console.log(findProduct);
        findProduct.salePrice -= Math.floor(findProduct.regularPrice * (percentage/100))
        findProduct.productOffer = parseInt(percentage)
        await findProduct.save()
        res.json({status : true})
    } catch (error) {
        console.log(error.message);
    }
}

const removeProductProductOffer = async (req, res) => {
    try {
        const {productId} = req.body
        const findProduct = await Product.findOne({_id : productId})
        const percentage = findProduct.productOffer
        findProduct.salePrice += Math.floor(findProduct.regularPrice * (percentage/100))
        findProduct.productOffer = 0
        await findProduct.save()
        res.json({status : true})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    addProductGet,
    productListGet,
    addProduct,
    editProductGet,
    editProduct,
    deleteSingleImage,
    blockProduct,
    unblockProduct,
    addProductProductOffer,
    removeProductProductOffer
}