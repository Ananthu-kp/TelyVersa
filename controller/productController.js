const Product=require("../model/productModel")

const addProductGet=async(req,res)=>{
    res.render("admin/adminAddProduct")
}


const productListGet = async (req, res) => {
    try {
        const data = await Product.find({});
        console.log(data);
        res.render("admin/adminViewProducts", { data });
    } catch (err) {
        console.error("Product Listing error", err);
        res.status(500).send("Internal Server Error");
    }
};

const addProduct = async (req, res) => {
    try {
        const productData = req.body;
        console.log(req.body);
        const images = req.files;
        const productImage = images ? images[0].filename : null;

        // Check if a product with the same name already exists
        const existingProduct = await Product.findOne({ name: productData.productName });

        if (!existingProduct) {
            const images = [];

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                }
            }

            const newProduct = new Product({
                productName: productData.productName,
                description: productData.description,
                regularPrice: productData.regularPrice,
                salePrice: productData.salePrice,
                quantity: productData.quantity,
                size: productData.size,
                resolution: productData.resolution,
                category: productData.category,
                productImage: productImage,
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


module.exports={
    addProductGet,
    productListGet,
    addProduct
}