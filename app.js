const express = require("express");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require('hpp');


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRouter');
const AppError = require("./utils/appError");
const gloabalErrorHandler = require('./controller/errorController');


app = express();

app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
const throttling = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // 100 request / hr
    message: "Too many requests from this IP address, please try again in an hour"
});
app.use('/api', throttling);


app.use(express.json({ limit: "10kb" }));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());


// prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price']
}));

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find the ${req.orginalUrl} on this server`);
    // err.status = "fail";
    // err.statusCode = 404;
    // next(err);
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})


app.use(gloabalErrorHandler);

module.exports = app; 