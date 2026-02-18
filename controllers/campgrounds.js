const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const maxImages = 5;

module.exports.index = async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (request, response) => {
    response.render('campgrounds/new', { maxImages });
}

module.exports.createCampground = async (request, response, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: request.body.campground.location,
        limit: 1
    }).send();
    const newCampground = new Campground(request.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = request.files.map(file => ({url: file.path, filename: file.filename}));
    console.log(newCampground.images);

    newCampground.author = request.user._id;
    await newCampground.save();
    console.log(newCampground);
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
    response.render('campgrounds/edit', {campground, maxImages});
}

module.exports.updateCampground = async (request, response) => {
    const {id} = request.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {...request.body.campground});
    const images = request.files.map(file => ({url: file.path, filename: file.filename}));
    console.log(images);
    updatedCampground.images.push(...images);
    await updatedCampground.save();
    if(request.body.deleteImages)
    {
        for(let filename of request.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({$pull: {images: {filename: {$in: request.body.deleteImages}}}});
    }
    request.flash('success', 'Successfully edit a campground!');
    response.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (request, response) => {
    const {id} = request.params;
    await Campground.findByIdAndDelete(id);
    request.flash('success', 'Successfully deleted campground!');
    response.redirect('/campgrounds');
}