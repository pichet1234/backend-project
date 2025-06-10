var mongoose = require('../connect');

var assessment9q = mongoose.model('assessment9q', require('../schema/assessments_9q'));

module.exports = {
    addaess: (req, res)=>{

        console.log(req.body)
        assessment9q.insertMany([{
            pid: req.body.pid,
            userid: req.body.userid,
            q1:req.body.q1,
            q2:req.body.q2,
            q3:req.body.q3,
            q4:req.body.q4,
            q5:req.body.q5,
            q6:req.body.q6,
            q7:req.body.q7,
            q8:req.body.q8,
            q9:req.body.q9,
            score:req.body.score,
            risklevel:req.body.risklevel,
            assessmentdate:new Date(),
            note:'0=ไม่มีเลย,1=เล็กน้อย,2=ค่อนข้างมา,3=มากที่สุด'
        }]).then(result => {
            res.status(201).json({
                message: 'ผลการประเมิน',
                data: result,
            });
        }).catch(err => {
            res.status(500).json({ message: 'Error 9Q', error: err });
        })
    }
}