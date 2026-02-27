const Review = require('../models/review');
const Spot = require('../models/spot');

module.exports.createReview = async (request, response) => {
    const spot = await Spot.findById(request.params.id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    spot.reviews.push(review);
    await review.save();
    await spot.save();
    request.flash('success', 'Successfully created a new review!');
    response.redirect(`/spots/${spot._id}`);
}

module.exports.deleteReview = async (request, response) => {
    const { id, reviewId } = request.params;
    await Spot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    request.flash('success', 'Successfully deleted review!');
    response.redirect(`/spots/${id}`);
}