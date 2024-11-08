const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "name should be set"],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
    },
    slug: String,
    duration: {
        type: Number,
        require: [true,]
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10 / 10)
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    screatTour: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        require: [true, "Price must be set"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    //child refrencing 
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        description: String,
        coordinates: [Number],
        day: Number
    }],
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }]

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }

);

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual property
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});


tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: '_id'
})

// document middleware
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// instead of this, shifted to parent ref 
// tourSchema.pre('save', async function (next) {
//     const tourPromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(tourPromise);
//     next();
// });


// query middleware
tourSchema.pre(/^find/, function (next) {
    // this keyword will point to the query instead of current document
    // the find in the parameter is the query method
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-_v -passwordChangedAt'
    });
    next();
});

// tourSchema.post('')

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;