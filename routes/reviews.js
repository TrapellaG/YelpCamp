const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (request, response) => {
    const { id, reviewId } = request.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    request.flash('success', 'Successfully deleted review!');
    response.redirect(`/campgrounds/${id}`);
}));

router.post("/", isLoggedIn, validateReview, catchAsync(async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    request.flash('success', 'Successfully created a new review!');
    response.redirect(`/campgrounds/${campground._id}`);
}));

module.exports = router;