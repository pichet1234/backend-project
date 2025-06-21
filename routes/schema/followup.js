const mongoose = require('../connect');

var followupSchema = mongoose.Schema({ 
    pid: mongoose.Schema.Types.ObjectId,
    followUpDate:Date,
    followMethod:String,
    followCount:Number,
    follower:String,
    advice:String,
    nextAppointment:Date,
    referHospital:Boolean,
    note:String
},{collection:'followup'});

module.exports = followupSchema;