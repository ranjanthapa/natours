const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError");
const APIFeature = require('./../utils/apiFeatures.js')



exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError("Invalid ID, no doc found", 404));
    }
    return res.status(200).json({
        status: "Success",
        data: null
    })
}
);

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!tour) {
        return next(new AppError("Invalid ID, no doc found", 404));
    }
    return res.status(200).json({
        status: "Success",
        message: {
            data: null
        }
    })

}
);



exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    return res.status(200).json({
        status: "Success",
        data: {
            newDoc
        }
    })
}
);


exports.getOne = (Model, popOptions) => catchAsync(async function (req, res, next) {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
        return next(new AppError("Invalid id, not found", 400));
    }
    return res.status(200).json({
        status: "success",
        data: {
            doc
        }
    });
});


exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Query execution
    const features = new APIFeature(Model.find(filter), req.query)
        .filter().
        sort().
        limitFields().
        paginate();
    const docs = await features.query.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    res.status(200).json({
        status: "success",
        result: docs.length,
        data: { docs }
    });
});