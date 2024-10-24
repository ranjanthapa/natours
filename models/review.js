const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        require: [true, "Review can't be empty"]
    },
    rating: {
        type: Number,
        // max: [5, "Rate the tour out of 5"]
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        require: [true, "Review must belongs to a user"]

    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        require: [true, "Review must belongs to a tour"]
    }
});

// query middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo"
    });
    next();
})

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;