const mongoose = require('../connect');

const Followup = mongoose.model('followup', require('../schema/followup'));

module.exports = {
    savefollow: async (req, res)=>{
        try{
            const followup = new Followup({
                pid: req.body.pid,
                followUpDate: req.body.followUpDate,
                followMethod: req.body.followMethod,
                followCount: req.body.followCount,
                follower: req.body.follower,
                advice: req.body.advice,
                nextAppointment: req.body.nextAppointment,
                referHospital: req.body.referHospital,
                note: req.body.note
            });

        const result = await followup.save();
        res.status(201).json({ message: 'บันทึกข้อมูลเรียบร้อย', data: result });
        }catch(error){
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error });
        }
    }
}