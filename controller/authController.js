const AppError = require('../utils/appError');
const catchAsync = require("../utils/catchAsync");

const User = require('./../models/userModel.js');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const validateBeforeSave = require("mongoose/lib/plugins/validateBeforeSave");
const sendEmail = require("../utils/email");
const crypto = require('crypto');

const socialMedia = require("../models/userModel.js")



const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {          // payload, secretkey, options
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id);

    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure: true, // the cookie will only send to the https
        httpOnly: true // it can't be accessed or modified by any browser prevent csx attack
    }

    if (process.env.NODE_ENV === "production") cookieOption.secure = true;
    res.cookie('jwt', token, cookieOption);
    user.password = undefined;
    return res.status(statusCode).json({
        status: "sucess",
        token,
        data: {
            user
        }
    });
}


exports.SignUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 200, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400))
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password, user.password))) {
        return next(new AppError("Invalid email or password", 401));
    }

    createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("No user found with the requested email", 400));
    }

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: 
    ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (Valid for 10 min only)",
            message
        });
        return res.status(200).json({
            status: "success",
            message: "Token sent to email"
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;
        return next(new AppError("There was an error sending email, please try again later", 500));
    }


});


exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user base on token
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordTokenExpires: { $gt: Date.now() } })

    if (!user) {
        return next(new AppError("Invalid token or the reset duration is expire", 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();
    createSendToken(user, 200, res);
});


exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.isCorrectPassword(req.body.currentPassword, user.password))) {
        return next(new AppError("Current password donot match", 400))
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    createSendToken(user, 200, res);
})

//middlewares
exports.protect = catchAsync(async (req, res, next) => {
    // it will check if the user is authenticate or not
    // check if the header has authorization, if not throw error
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        console.info(req.headers.authorization.split(" "));
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        console.error('No token provided');
        return next(new AppError("Login required, please login to get access", 401));
    }
    console.log("token also verify");

    // verify the jwt 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.error(decoded);
    // check the user exists or not 
    const currentUser = await User.findById(decoded.id);
    console.log("The new user is ", currentUser);

    if (!currentUser) {
        return next(new AppError("The user belonging to this token no longer exists", 401));
    }

    // check if user change the password after the token is issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError("User recently change the password, please login again"), 401)
    }

    req.user = currentUser;
    next();

});


exports.restrictTo = (...roles) => {

    return (req, res, next) => {
        console.log(req.user);
        if (!roles.includes(req.user.roles)) {
            return next(new AppError("You do not have permission to perform the task", 403));
        }
        next();
    }
}


