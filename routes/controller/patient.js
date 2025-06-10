var mongoose = require('../connect');
var patient = mongoose.model('patient', require('../schema/patient'));

module.exports = {
    regispatient: async (req, res) => {
        try {
            const existing = await patient.findOne({ cid: req.body.cid }).collation({ locale: 'th', strength: 1 });
    
            if (existing) {
                return res.status(400).json({
                    message: 'ท่านเคยลงทะเบียนแล้ว',
                    patientId:existing._id
                });
            }
            const result = await patient.insertMany([
                {
                    cid: req.body.cid,
                    prefix: req.body.prefix,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    phone: req.body.phone,
                    address: {
                        bannumber: req.body.banumber,
                        moo: req.body.moo,
                        subdistrict: req.body.subdistrict.name_th,
                        district: req.body.district.name_th,
                        province: req.body.province.name_th
                    },
                    latitude: req.body.latitude,
                    longitude: req.body.longitude
                }
            ]);
    
            res.status(201).json({
                message: 'ลงทะเบียนสำเร็จ',
                data: result,
            });
    
        } catch (err) {
            res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: err });
        }
    },
    getpatient: (req, res)=>{
        patient.find({ }).then((result)=>{
            res.json(result)
        }).catch((err)=>{
            console.log(err)
        })
    },
    getpatass: (req, res)=>{
        patient.aggregate([
            {
                "$lookup":{
                    "from":'assessment2q',
                    "localField":'_id',
                    "foreignField":'pid',
                    "as":'2Q'
                }
            },
            {
                "$lookup":{
                    "from":'assessment9q',
                    "localField":'_id',
                    "foreignField":'pid',
                    "as":'9Q'
                }
            }
        ]).then((result)=>{
            res.json(result)
        }).catch((err)=>{
            console.log(err)
        })
    }
}