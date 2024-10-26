const authController = require('./../controller/authController');
const express = require('express');
const userController = require('./../controller/userController');

const router = express.Router();

router.route('/signup').post(authController.SignUp);
router.route('/login').post(authController.login);
router.route("/forgot-password").post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);

router.use(authController.protect);

router.route('/update-password').patch(authController.updatePassword);
router.get('/me', userController.getMe, userController.getUserById);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);


router.use(authController.restrictTo("admin"));
router.route('/users').get(userController.allUser);
router.route("/:id").get(userController.getUserById);



module.exports = router;