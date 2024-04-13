const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cites = require('./cites');
const {places , descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Connection:
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error!"));
db.once("open", () => {
    console.log('Database is Connected!!!');
})

// Random number array generation:
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20);
        const camp = new Campground({
            author: '65e1a4f32c4da3a5ad99f90d',
            location: `${cites[random1000].city}, ${cites[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Non necessitatibus quod facere magnam fugit velit ullam adipisci et iure quos! Aliquid recusandae velit tempore sint corrupti necessitatibus voluptatibus in quas.",
            price,
            images: [
      {
        url: 'https://res.cloudinary.com/dfmsjjirh/image/upload/v1712684808/YelpCamp/vpnvngib9f38isd0dqag.png',
        filename: 'YelpCamp/vpnvngib9f38isd0dqag',
      },
      {
        url: 'https://res.cloudinary.com/dfmsjjirh/image/upload/v1712684808/YelpCamp/hpilqwsbxn5viihhebkd.png',
        filename: 'YelpCamp/hpilqwsbxn5viihhebkd',
      }
    ],

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})