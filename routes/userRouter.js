const authController = require('./../controller/authController');
const express = require('express');
const userController = require('./../controller/userController');

const router = express.Router();

router.route('/signup').post(authController.SignUp);
router.route('/login').post(authController.login);
router.route("/forgot-password").post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);

router.route('/update-password').patch(authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.route('/users').get(userController.allUser);

router.route("/:id").get(userController.getUserById);

module.exports = router;