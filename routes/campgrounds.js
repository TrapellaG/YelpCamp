const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

router.get('/', catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (request, response) => {
    response.render('campgrounds/new');
});

router.post('/', isLoggedIn, validateCampground, catchAsync(async (request, response, next) => {
    const newCampground = new Campground(request.body.campground);
    newCampground.author = request.user._id;
    await newCampground.save();
    request.flash('success', 'Successfully made a new campground!');
    response.redirect(`/campgrounds/${newCampground._id}`);
}));

router.get('/:id', catchAsync(async (request, response) => {
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
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    if(!campground) {
        request.flash('error', 'Cannot find that campground!');
        return response.redirect('/campgrounds');
    }
    response.render('campgrounds/edit', {campground});
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (request, response) => {
    const {id} = request.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {...request.body.campground});
    request.flash('success', 'Successfully edit a campground!');
    response.redirect(`/campgrounds/${updatedCampground._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (request, response) => {
    const {id} = request.params;
    await Campground.findByIdAndDelete(id);
    request.flash('success', 'Successfully deleted campground!');
    response.redirect('/campgrounds');
}));

module.exports = router;