const Banner=require("../model/bannerModel")

const getBanner = async(req,res)=>{
    try {
        const findBanner = await Banner.find({})
        res.render("admin/banner",{ data:findBanner, bannerActive:true})
    } catch (error) {
        console.log(error.message);
    }
}




const getAddBannerPage = async (req, res) => {
    try {
        res.render("admin/addBanner" ,{bannerActive:true})
    } catch (error) {
        console.log(error.message);
    }
}

const postAddBanner = async (req, res) => {
    try {
        const data = req.body
        console.log(req.body);
        const image = req.file
        
        if (!image) {
            return res.status(400).send('An image is required for the banner.');
        }

        const newBanner = new Banner({
            image: image.filename,
            title: data.title,
            description: data.description,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            link: data.link
        })

        await newBanner.save()
            .then(data => console.log(data))
        res.redirect("/admin/banner")

    } catch (error){
        console.log(error.message);
        res.status(500).send('An error occurred while adding the banner.');
    }
}


const getEditBannerPage = async (req, res) => {
    try {
        const id = req.query.id
        const findBanner = await Banner.findOne({ _id: id })
        console.log(findBanner);
        res.render("admin/editBanner", { data: findBanner ,bannerActive:true})
    } catch (error) {
        console.log(error.message);
    }
}

const postEditBanner = async (req, res) => {
    try {
        // const image = req.file.filename
        const data = req.body
        const id = req.query.id

        if (req.file) {
            
                image = req.file.filename

                await Banner.updateOne(
                    { _id: id },
                    {
                        $set: {
                            image: image,
                            title: data.title,
                            description: data.description,
                            link: data.link,
                            startDate: new Date(data.startDate + 'T00:00:00'),
                            endDate: new Date(data.endDate + 'T00:00:00'),
                        }
                    }
        
                )
                .then((data)=>console.log(data))
           
        }else{
            await Banner.updateOne(
                { _id: id },
                {
                    $set: {
                     
                        title: data.title,
                        description: data.description,
                        link: data.link,
                        startDate: new Date(data.startDate + 'T00:00:00'),
                        endDate: new Date(data.endDate + 'T00:00:00'),
                    }
                }
    
            )
            .then((data)=>console.log(data))
        }

        
        
        res.redirect("/admin/banner")

    } catch (error) {
        console.log(error.message);
    }
}

const deleteBanner = async (req, res)=>{
    try {
        const id = req.query.id
        await Banner.deleteOne(
            {_id : id}
        )
        .then((data)=>console.log(data))
        res.redirect("/admin/banner")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    getBanner,
    getAddBannerPage,
    postAddBanner,
    getEditBannerPage,
    postEditBanner,
    deleteBanner
}