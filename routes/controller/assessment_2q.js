var mongoose = require('../connect');

var assessment2q = mongoose.model('assessment2q', require('../schema/assessments_2q'));

module.exports = {
    addaess: (req, res)=>{

        console.log(req.body)
        assessment2q.insertMany([{
                pid: req.body.pid,
                userid: req.body.userid,
                q1: req.body.q1,
                q2: req.body.q2,
                score:req.body.score,
                result:req.body.result,
                assessmentdate: new Date(),
                note:'1=มี, 0=ไม่มี'
        }]).then(result => {
            res.status(201).json({
                message: 'ผลการทำแบบประเมิน',
                data: result,
            });
        }).catch(err => {
            res.status(500).json({ message: 'Error insert meet', error: err });
        })
    }
}