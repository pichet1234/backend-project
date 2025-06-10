var mongoose = require('../connect');

var userSchema = new mongoose.Schema({ 
    username: String,
    password:String,
    role:String,
    fullname:String,
    position:String,
    email:String,
    tel:String,
    imgprofile:String,
    creartedate:{ type:Date, default: Date.now},
    resetToken: String,
    resetTokenExpire: Date
}, { collation: 'users'});

module.exports = userSchema;