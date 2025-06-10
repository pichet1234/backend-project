const mongoose = require('mongoose');
require('dotenv').config(); // โหลดค่าจาก .env

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to database SaveLife');
}).catch((error) => {
    console.log('error connecting my database savelife', error);
});

module.exports = mongoose;
