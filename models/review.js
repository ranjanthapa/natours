const mongoose = require("mongoose");
const Tour = require('./tourModel');

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

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }


};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});


reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
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