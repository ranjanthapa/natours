const User = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require('./../utils/catchAsync');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}


exports.allUser = catchAsync(async (req, res, next) => {
    const users = await User.find();
    return res.status(200).json({
        status: "sucess",
        users: {
            users
        }
    })
});


exports.getUserById = catchAsync(async function (req, res, next) {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError("User doesn't exists with the given id", 400));
    }
    return res.status(200).json({
        status: "success",
        data: user
    });
});



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

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    return res.status(204).json({
        status: "success"
    })
})