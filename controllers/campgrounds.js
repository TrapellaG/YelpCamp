const Campground = require('../models/campground');

module.exports.index = async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (request, response) => {
    response.render('campgrounds/new');
}

module.exports.createCampground = async (request, response, next) => {
    const newCampground = new Campground(request.body.campground);
    newCampground.author = request.user._id;
    await newCampground.save();
    request.flash('success', 'Successfully made a new campground!');
    response.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.showCampground = async (request, response) => {
    const campground = await Campground.findById(request.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if(!campground) {
        request.flash('error', 'Cannot find that campground!');
        return response.redirect('/campgrounds');
    }
    response.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    if(!campground) {
        request.flash('error', 'Cannot find that campground!');
        return response.redirect('/campgrounds');
    }
    response.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (request, response) => {
    const {id} = request.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {...request.body.campground});
    request.flash('success', 'Successfully edit a campground!');
    response.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (request, response) => {
    const {id} = request.params;
    await Campground.findByIdAndDelete(id);
    request.flash('success', 'Successfully deleted campground!');
    response.redirect('/campgrounds');
}