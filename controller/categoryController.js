const Category=require("../model/categoryModel")

const categoryGet = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render("admin/adminCategory", { category: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryExists = await Category.findOne({ name });

        if (!categoryExists) {
            const newCategory = new Category({
                 name: name,
               description: description
            });

            await newCategory.save();
            console.log("Category done:", newCategory);
            res.redirect("/admin/allCategory");
        } else {
            res.redirect("/admin/category");
            console.log("Category Already exists");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};




const categoryAllGet = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render("admin/adminCategory", { category: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}







module.exports = {
    categoryGet,
    addCategory,
    categoryAllGet,
}