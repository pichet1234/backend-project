var mongoose = require('../connect');

var assessments9qSchema = mongoose.Schema({
    pid: mongoose.Schema.Types.ObjectId,
    userid: mongoose.Schema.Types.ObjectId,
    q1:Number,
    q2:Number,
    q3:Number,
    q4:Number,
    q5:Number,
    q6:Number,
    q7:Number,
    q8:Number,
    q9:Number,
    score:Number,
    risklevel:String,
    assessmentdate:{ type:Date, default: Date.now},
    note:String

},{ collection:'assessment9q'});

module.exports = assessments9qSchema;