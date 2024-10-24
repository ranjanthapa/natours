const express = require("express");


const reviewRouter = express.Router({ mergeParams: true });
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');



reviewRouter.route('/')
    .get(reviewController.getAllReview)
    .post(authController.protect, authController.restrictTo("user"),
        reviewController.setUserAndId, reviewController.createReview);



reviewRouter.route('/:id')
    .get(reviewController.getReview)
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview);
module.exports = reviewRouter;