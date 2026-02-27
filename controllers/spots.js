const Spot = require('../models/spot');
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const maxImages = 5;

module.exports.index = async (request, response) => {
    const spots = await Spot.find({});
    response.render('spots/index', { spots });
}

module.exports.renderNewForm = (request, response) => {
    response.render('spots/new', { maxImages });
}

module.exports.createSpot = async (request, response, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: request.body.spot.location,
        limit: 1
    }).send();
    const newSpot = new Spot(request.body.spot);
    newSpot.geometry = geoData.body.features[0].geometry;
    newSpot.images = request.files.map(file => ({url: file.path, filename: file.filename}));
    console.log(newSpot.images);

    newSpot.author = request.user._id;
    await newSpot.save();
    console.log(newSpot);
    request.flash('success', 'Successfully made a new spot!');
    response.redirect(`/spots/${newSpot._id}`);
}

module.exports.showSpot = async (request, response) => {
    const spot = await Spot.findById(request.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if(!spot) {
        request.flash('error', 'Cannot find that spot!');
        return response.redirect('/spots');
    }
    response.render('spots/show', {spot});
}

module.exports.renderEditForm = async (request, response) => {
    const spot = await Spot.findById(request.params.id);
    if(!spot) {
        request.flash('error', 'Cannot find that spot!');
        return response.redirect('/spots');
    }
    response.render('spots/edit', {spot, maxImages});
}

module.exports.updateSpot = async (request, response) => {
    const {id} = request.params;
    const updatedSpot = await Spot.findByIdAndUpdate(id, {...request.body.spot});
    const images = request.files.map(file => ({url: file.path, filename: file.filename}));
    console.log(images);
    updatedSpot.images.push(...images);
    await updatedSpot.save();
    if(request.body.deleteImages)
    {
        for(let filename of request.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedSpot.updateOne({$pull: {images: {filename: {$in: request.body.deleteImages}}}});
    }
    request.flash('success', 'Successfully edit a spot!');
    response.redirect(`/spots/${updatedSpot._id}`);
}

module.exports.deleteSpot = async (request, response) => {
    const {id} = request.params;
    await Spot.findByIdAndDelete(id);
    request.flash('success', 'Successfully deleted spot!');
    response.redirect('/spots');
}