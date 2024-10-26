const express = require("express");


const reviewRouter = express.Router({ mergeParams: true });
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');

reviewRouter.use(authController.protect);


reviewRouter.route('/')
    .get(reviewController.getAllReview)
    .post(authController.restrictTo("user"),
        reviewController.setUserAndId, reviewController.createReview);



reviewRouter.route('/:id')
    .get(reviewController.getReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrictTo('guide', 'admin'),
        reviewController.updateReview);
module.exports = reviewRouter;