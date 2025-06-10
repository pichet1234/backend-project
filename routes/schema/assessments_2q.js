var mongoose = require('../connect');

var assessments2qSchema = mongoose.Schema({
    pid: mongoose.Schema.Types.ObjectId,
    userid: mongoose.Schema.Types.ObjectId,
    q1:Number,
    q2:Number,
    score:Number,
    result:String,
    assessmentdate: { type:Date, default: Date.now},
    note:String

},{ collection:'assessment2q'});

module.exports = assessments2qSchema;