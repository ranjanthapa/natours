// const fs = require('fs');
const Tour = require('../model/tourModel.js');
const AppError = require('../utils/appError');
const APIFeature = require('./../utils/apiFeatures.js')
const catchAsync = require('./../utils/catchAsync.js');


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


exports.getAllTour = catchAsync(async (req, res, next) => {
    // Query execution
    const features = new APIFeature(Tour.find(), req.query)
        .filter().
        sort().
        limitFields().
        paginate();
    const tours = await features.query;
    res.status(200).json({
        status: "success",
        result: tours.length,
        data: { tours }
    });
});



exports.postTour = catchAsync(async (req, res, next) => {
    // const newID = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newID }, req.body);
    // tours.push(newTour);
    // fs.writeFile('./dev-data/data/tours.js', JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: "succcess", data: {
    //             newTour
    //         }
    //     })
    // })

    const newTour = await Tour.create(req.body);
    return res.status(200).json({
        status: "Success",
        data: {
            newTour
        }
    })
}
);


exports.getTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError("Invalid ID, no tour found", 404));
    }

    return res.status(200).json({
        status: "Success",
        message: {
            tour
        }
    })
}
);

exports.updateByTourID = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!tour) {
        return next(new AppError("Invalid ID, no tour found", 404));
    }
    return res.status(200).json({
        status: "Success",
        message: {
            tour
        }
    })

}
);

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError("Invalid ID, no tour found", 404));
    }
    return res.status(200).json({
        status: "Success",
        data: null
    })
}
);

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