const validator = require("validator");
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const { resetPassword } = require("../controller/authController");
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'A name should be set'],
        trim: true,
        minLength: [20, "Minimum length of name shoud be 20 character"],
        maxLength: [20, "Maximum length of name should not exced 50 character"]
    },
    email: {
        type: String,
        require: [true, 'Email should be set'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide an valid email"]
    },
    photo: String,
    roles: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: "user",

    },
    password: {
        type: String,
        require: [true, "Password should be set"],
        minLength: [8, "Weak password, minimum of 8 character is require"],
        select: false

    },
    confirmPassword: {
        type: String,
        require: [true, "Please confirm your password"],
        validate: {
            validator: function (val) {
                return val === this.password
            },
            message: "Password are not match"
        }

    },
    passwordChangeAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// document middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangeAt = Date.now() - 1000;
    return next();
});

//instance method 
userSchema.methods.isCorrectPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changeTimeStamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        return JWTTimestamp < changeTimeStamp;
    }
    return false;
}


userSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    console.log(resetToken, this.resetPasswordToken);

    this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}


// query middleware
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;