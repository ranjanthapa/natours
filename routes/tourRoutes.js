const express = require("express");
const tourController = require('./../controller/tourController');
const authController = require("./../controller/authController");
const tourRouter = express.Router();
const reviewRouter = require('./reviewRoute');



// tourRouter.param('id', tourController.checkID); // middleware that checks the id validation

tourRouter.use('/:tourId/reviews', reviewRouter);


tourRouter.route('/top-5-cheap').get(tourController.alisTour, tourController.getAllTour);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route("/monthly-plan/:year")
    .get(authController.protect, authController.restrictTo("admin", "guide", "lead-guide"),
        tourController.getMonthlyPlan);

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);


tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

tourRouter.route("/")
    .post(tourController.checkBody,
        authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.createTour)
    .get(authController.protect, tourController.getAllTour);

tourRouter.route("/:id")
    .get(tourController.getTourById)

    .patch(authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.updateByTourID)

    .delete(authController.protect,
        authController.restrictTo("admin", "lead-guide"),
        tourController.deleteTour);




module.exports = tourRouter;