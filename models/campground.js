const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
        filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, // <- To make relation of campgrounds and author documents
        ref: "User" // <- The Relation Document (Model Name)
    },
    review: [{
        type: Schema.Types.ObjectId, // <- To make relation of campgrounds and reviews documents
        ref: "Review" // <- The Relation Document (Model Name)
    }]
});

// To Add a post middleware while deleting a campground to delete all the related reviews to the campground!
CampgroundSchema.post('findOneAndDelete', async function (doc) { // <- When findoneanddelete middleware is called this function runs!!!
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.review}
        })
    }
} )

module.exports = mongoose.model('Campground', CampgroundSchema);