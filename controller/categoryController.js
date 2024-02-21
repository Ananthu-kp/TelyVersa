const Category=require("../model/categoryModel")

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
        const { name, description }=req.body;
        const categoryExists = await Category.findOne({ name });

        if (!categoryExists) {
            const newCategory=new Category({
                 name:name,
               description:description
            });

            await newCategory.save();
            console.log("Category done:", newCategory);
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
        res.render("admin/editCategory", { category: category });
    } catch (error) {
        console.log(error.message);
    }
};

const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { categoryName, description } = req.body;
        
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
    } catch (error) {
        console.log(error.message);
    }
};







module.exports = {
    categoryGet,
    addCategory,
    listCategoryGet,
    unlistCategoryGet,
    editCategoryGet,
    editCategory
}