const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const factory = require('./handleFactory');

const response = (res, statusCode, data) => {
    return res.status(statusCode).json({
        status: "success",
        data: { data }
    })
}

exports.getReview = factory.getOne(Review);


exports.getAllReview = factory.getAll(Review);

exports.setUserAndId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}


exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);