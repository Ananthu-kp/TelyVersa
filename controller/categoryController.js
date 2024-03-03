const Category=require("../model/categoryModel")
const Product= require("../model/productModel")

const categoryGet = async (req, res) => {
    try {
        const page= parseInt(req.query.page)||1;
        const perpage= 4;
        
        const totalCat= await Category.countDocuments({});
        const totalPages= Math.ceil(totalCat/perpage);

        const categoryData = await Category.find({})
                .skip((page - 1)* perpage)
                .limit(perpage);
        res.render("admin/adminCategory", { category: categoryData ,currentPage: page, totalPages,Category:true})
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryName = name.trim().toLowerCase(); 
        const categoryExists = await Category.findOne({ name: { $regex: new RegExp('^' + categoryName + '$', 'i') } });

        if (!categoryExists) {
            const newCategory = new Category({
                name: name,
                description: description
            });

            await newCategory.save();
            console.log("Category added:", newCategory);
            res.redirect("/admin/category");
        } else {
            res.redirect("/admin/category");
            console.log("Category Already exists");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};



const listCategoryGet = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};

const unlistCategoryGet = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};

const editCategoryGet = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.findOne({ _id: id });
        const errorMessage = req.query.error || '';
        res.render("admin/editCategory", { category: category ,Category:true ,errorMessage: errorMessage});
    } catch (error) {
        console.log(error.message);
    }
};

const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { categoryName, description } = req.body;
        const updatedCategoryName = categoryName.trim().toLowerCase(); 
        
        const categoryExists = await Category.findOne({ _id: { $ne: id }, name: { $regex: new RegExp('^' + updatedCategoryName + '$', 'i') } });

        if (!categoryExists) {
            const findCategory = await Category.findById(id);

            if (findCategory) {
                await Category.updateOne(
                    { _id: id },
                    {
                        name: categoryName,
                        description: description
                    }
                );
                res.redirect("/admin/category");
            } else {
                console.log("Category not found");
            }
        } else {
            res.redirect("/admin/category");
            console.log("Category Already exists");
        }
    } catch (error) {
        console.log(error.message);
    }
};



const addCategoryOffer = async (req, res)=>{
    try {
        const percentage = parseInt(req.body.percentage)
        const categoryId = req.body.categoryId  
        // console.log(percentage, categoryId);
        const findCategory = await Category.findOne({_id : categoryId})
        // console.log(findCategory);
        await Category.updateOne(
            {_id : categoryId},
            {$set : {
                categoryOffer : percentage
            }}
        )
        .then(data=>{
            console.log(data)
            console.log("categoryOffer added");
        })

        const productData = await Product.find({category : findCategory.name})
        // console.log(productData);

        for(const product of productData){
            product.salePrice = product.salePrice - Math.floor(product.regularPrice * (percentage / 100) )
            await product.save()
        }

        res.json({status : true})

    } catch (error) {
        console.log(error.message);
    }
}


const removerCategoryOffer = async (req, res)=>{
    try {
        // console.log(req.body);
        const categoryId = req.body.categoryId
        const findCategory = await Category.findOne({_id : categoryId})
        console.log(findCategory);

        const percentage = findCategory.categoryOffer
        // console.log(percentage);
        const productData = await Product.find({category : findCategory.name})

        if(productData.length > 0){
            for(const product of productData){
                product.salePrice = product.salePrice +  Math.floor(product.regularPrice * (percentage / 100))
                await product.save()
            }
        }

        findCategory.categoryOffer = 0
        await findCategory.save()

        res.json({status : true})

    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    categoryGet,
    addCategory,
    listCategoryGet,
    unlistCategoryGet,
    editCategoryGet,
    editCategory,
    addCategoryOffer,
    removerCategoryOffer
}