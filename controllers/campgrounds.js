const Campground = require('../models/campground')

const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => { //<- isLoggedIn is a middleware defined to validate user access with route!!!
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    // if (!req.body.campground) throw new ExpressError("Enter Valid Campground Data", 400);
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id
    await campground.save();
    req.flash('success', 'Successfully Created a Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({
        path: 'review', populate: {
        path: 'author' //<- To populate author for each review;
    }}).populate('author');// <- Populate is used to make other links of the other documents that are linked!
    if (!campground) {
        req.flash('error', 'Campground Not Found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {id, campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if (!campground) {
        req.flash('error', 'Campground Not Found!')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully Updated the Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground is deleted Successfully!')
    res.redirect('/campgrounds');
}