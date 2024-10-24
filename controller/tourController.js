// const fs = require('fs');
const Tour = require('../models/tourModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./handleFactory.js');


exports.getAllTour = factory.getAll(Tour);
exports.getTourById = factory.getOne(Tour, { path: "reviews" });
exports.updateByTourID = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.createTour = factory.createOne(Tour);

//middleware
exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Name or price missing',
        });
    }
    next();
};


exports.alisTour = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage, price';
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty';
    next();
};



exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: { $gte: 4.5 }
            }
        },
        {
            $group: {
                _id: "$_id",
                numTour: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRatings: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);
    return res.status(200).json({
        status: "success",
        data: stats
    });

});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        { $unwind: '$startDates' },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            }
        },

        {
            $group: {
                _id: { $month: "$startDates" },
                numTours: { $sum: 1 },
                tours: { $push: "$name" }
            }
        },

        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 } // if 0 the id will not be visible and 1 to visible
        },
        {
            $sort: { numTours: -1 } // -1 for descending and 1 for assending 
        }

    ]);

    return res.status(200).json({
        status: "success",
        result: plan.length,
        data: plan
    });


});