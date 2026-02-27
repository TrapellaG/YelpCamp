const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    request.flash('success', 'Successfully created a new review!');
    response.redirect(`/spots/${campground._id}`);
}

module.exports.deleteReview = async (request, response) => {
    const { id, reviewId } = request.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    request.flash('success', 'Successfully deleted review!');
    response.redirect(`/spots/${id}`);
}