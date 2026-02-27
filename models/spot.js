const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const options = { toJSON: { virtuals: true } };

const SpotSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, options);


SpotSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/spots/${this._id}">${this.title}</a></strong>`;
});

SpotSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        console.log(doc);
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Spot', SpotSchema);