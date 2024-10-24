const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});


dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(
        con => {
            console.log("database connected")
        }
    ).catch((err) => {
        console.error("Error ");
        console.error(err);
    })

console.log(process.env.NODE_ENV);
const port = 3000;
const server = app.listen(port, () => {
    console.log(`Listing to the port number ${port}`);
});

process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    console.log("Unhandle rejection, server shutting down");
    server.close(() => {
        process.exit(1);
    });
});
