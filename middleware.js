const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema,  reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');

module.exports.validateCampground = (request, response, next) => {
    const { error } = campgroundSchema.validate(request.body);
    if(error) {
        const message = error.details.map(element => element.message).join(',');
        throw new ExpressError(message, 400);
    }
    else {
        next();
    }
};

module.exports.isLoggedIn = (request, response, next) => {
    if(!request.isAuthenticated()) {
        request.session.returnTo = request.originalUrl;
        request.flash('error', 'You must be signed in first!');
        return response.redirect('/login');
    }
    next(); 
}

module.exports.storeReturnTo = (request, response, next) => {
    if (request.session.returnTo) {
        response.locals.returnTo = request.session.returnTo;
    }
    next();
}

module.exports.isAuthor= async (request, response, next) => {
    const { id } = request.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(request.user._id)) {
        request.flash('error', 'You do not have permission to do that!');
        return response.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor= async (request, response, next) => {
    const { id, reviewId } = request.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(request.user._id)) {
        request.flash('error', 'You do not have permission to do that!');
        return response.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (request, response, next) => {
    const { error } = reviewSchema.validate(request.body);
    if(error) {
        const message = error.details.map(element => element.message).join(',');
        throw new ExpressError(message, 400);
    }
    else {
        next();
    }
};
