var mongoose = require('../connect');

var assessments8qSchema = mongoose.Schema({
    pid: mongoose.Schema.Types.ObjectId,
    userid: mongoose.Schema.Types.ObjectId,
    answer1:Number,
    answer2:Number,
    answer3:Number,
    answer31:Number,
    answer4:Number,
    answer5:Number,
    answer6:Number,
    answer7:Number,
    answer8:Number,
    score:Number,
    risklevel:String,
    assessmentdate:Date,
    note:String

},{ collection:'assessment8q'});

module.exports = assessments8qSchema;