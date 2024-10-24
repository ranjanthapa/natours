const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel')
const fs = require('fs');
dotenv.config({ path: './config.env' });

console.log(process.env);

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
})
    .then(
        con => {
            console.log(con.connection);
            console.log("database connected")
        }
    );



// READ FILE
const tourData = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tourData);
        console.log("Data successfully loaded");
        process.exit();
    }
    catch (err) {
        console.log(err);
    }
}

// DELETE THE EXISTING DATA
const deleteAllData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data successfully delete");
        process.exit();

    }
    catch (err) {
        console.log(err);
    }
}

if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteAllData();
}