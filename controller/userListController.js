const User=require("../model/userModel")

const displayUser= async(req, res) => {
    try {
        const data = await User.find({});
        console.log(data);
        res.render("admin/users", { data });
    } catch (error) {
        console.error("error:", error);
        res.render("error", { errorMessage: "users not found" });
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