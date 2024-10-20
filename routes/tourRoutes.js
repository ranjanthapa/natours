const express = require("express");
const tourController = require('./../controller/tourController');
const authController = require("./../controller/authController");
const tourRouter = express.Router();


// tourRouter.param('id', tourController.checkID); // middleware that checks the id validation

tourRouter.route('/top-5-cheap').get(tourController.alisTour, tourController.getAllTour);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

tourRouter.route("/")
    .post(tourController.checkBody, tourController.postTour)
    .get(authController.protect, tourController.getAllTour);

tourRouter.route("/:id")
    .get(tourController.getTourById)
    .patch(tourController.updateByTourID)
    .delete(authController.protect, authController.restrictTo("admin", "lead-guide"), tourController.deleteTour);



module.exports = tourRouter;