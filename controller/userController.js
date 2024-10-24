const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handleFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}


exports.allUser = factory.getAll(User);
exports.getUserById = factory.getOne(User);
exports.deleteMe = factory.deleteOne(User);



exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError("This route is not for password update, use /update-password"));
    }

    const filterBody = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });

    return res.status(204).json({
        status: "success",
        data: user
    });

});
