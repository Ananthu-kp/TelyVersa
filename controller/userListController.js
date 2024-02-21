const User=require("../model/userModel")

const displayUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const perPage = 4; 

        const totalUsers = await User.countDocuments({});
        const totalPages = Math.ceil(totalUsers / perPage);

        const data = await User.find({})
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render("admin/users", { data, currentPage: page, totalPages ,userList:true});
    } catch (error) {
        console.error("Error:", error);
        res.render("error", { errorMessage: "Users not found" });
    }
};


const blockUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{ isBlocked: 1 },{ new: true });
        console.log(updatedUser);
        res.redirect('/admin/userList');
    } catch (error) {
        console.error(error);
    }
};

const unblockUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{ isBlocked: 0 },{ new: true });
        console.log(updatedUser);
        res.redirect("/admin/userList");
    } catch (error) {
        console.error(error);
    }
};


module.exports={
    displayUser,
    blockUser,
    unblockUser
};