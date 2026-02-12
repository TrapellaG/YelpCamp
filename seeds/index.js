const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '698b15fafc254573673e46f9',
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dzjluoald/image/upload/v1770903267/YelpCamp/kwtpzwijuulnmy7rskpy.jpg',
                  filename: 'YelpCamp/kwtpzwijuulnmy7rskpy'
                },
                {
                  url: 'https://res.cloudinary.com/dzjluoald/image/upload/v1770903268/YelpCamp/zjvuknz7xculobcnmxkh.jpg',
                  filename: 'YelpCamp/zjvuknz7xculobcnmxkh'
                }
              ],
            price: (Math.random() * 20 + 10).toFixed(2),
            description: 'A wonderful place to camp with beautiful scenery and great amenities.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        });

        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});