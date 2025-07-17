var mongoose = require('../connect');

var assessment8q = mongoose.model('assessment8q', require('../schema/assessments_8q'));

module.exports = {
addaess: async (req, res) => {
        try {
            console.log(req.body)
            const result = await assessment8q.insertMany([{
                pid: req.body.pid,
                userid: req.body.userid,
                answer1: req.body.answer1,
                answer2: req.body.answer2,
                answer3: req.body.answer3,
                answer31: req.body.answer31,
                answer4: req.body.answer4,
                answer5: req.body.answer5,
                answer6: req.body.answer6,
                answer7: req.body.answer7,
                answer8: req.body.answer8,
                score: req.body.score,
                risklevel: req.body.risklevel,
                assessmentdate: new Date(),
                note: ''
            }]);

            res.status(201).json({
                message: 'บันทึกผลการประเมินสำเร็จ',
                data: result,
            });

        } catch (err) {
            res.status(500).json({ message: 'Error 8Q', error: err });
        }
    }

}