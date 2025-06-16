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
            res.send(result)
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
            },
            {
              $group: {
                _id: "$9Q.risklevel",
                patients: {
                  $push: {
                    cid: "$cid",
                    name: { $concat: ["$prefix", "$fname", " ", "$lname"] },
                    score: "$9Q.score",
                    assessmentdate: "$9Q.assessmentdate"
                  }
                }
              }
            }
        ]).then((result)=>{
            res.json(result)
        }).catch((err)=>{
            console.log(err)
        })
    },
    //ดึงรายชื่อตามเงื่อนไขทำแบบคัดกรอง 2Q และแบบสอบถาม 9Q แบ่งตาม lavel >=19
    getrad:(req, res)=>{
        patient.aggregate([{
            "$lookup":{
             "from":"assessment2q",
             "localField":"_id",
        	 "foreignField":"pid",
		     "as":"2Q"
            }
          },
          {
            "$lookup":{
                "from":"assessment9q",
                "localField":"_id",
                "foreignField":"pid",
                "as":"9Q"
             }
         },
         {
          "$match": { // เงื่อนไข score >= 8 
            "9Q.score": { "$gte": 19 }
            }
         }
        ]).then((result)=>{
            res.json(result)
        }).catch((err)=>{
            console.log(err)
        })
    },
    countred: async(req, res)=>{
        try{
            const result = await patient.aggregate([
            {
                $lookup: {
                from: "assessment9q",
                localField: "_id",
                foreignField: "pid",
                as: "9Q"
                }
            },
            {
                $match: {
                "9Q.score": { $gte: 19 }// score > 7 แต่ไม่เกิน 12 score <=12 
                }
            },
            {
                $group: {
                _id: null,
                count: { $sum: 1 }
                }
            }
            ]);
            res.json(result);
        }catch(err){
            res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });  
        }
    },
    //นับจำนวนผู้ที่มี"อาการซึมเศร้าเล็กน้อย" getmoderate
    getmoderate: async (req, res)=>{
        try{
            const result = await patient.aggregate([
                {
                    "$lookup":{
                        "from":'assessment9q',
                        "localField":'_id',
                        "foreignField":'pid',
                        "as":'9Q'
                    }
                },
                {
                    "$match":{
                        "9Q.score":{ "$gt": 13, "$lte":18 }
                    }
                }
            ]);
            res.json(result);
        }catch(err){
            res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });           
        }
    },
    countmoderate:async (req, res)=>{
        try{
            const result = await patient.aggregate([
            {
                $lookup: {
                from: "assessment9q",
                localField: "_id",
                foreignField: "pid",
                as: "9Q"
                }
            },
            {
                $match: {
                "9Q.score": { "$gt": 13, "$lte":18 }// score > 7 แต่ไม่เกิน 12 score <=12 
                }
            },
            {
                $group: {
                _id: null,
                count: { $sum: 1 }
                }
            }
            ]);
            res.json(result);
        }catch(err){
            res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });           
        }
    },
    //นับจำนวนผู้ที่มี"อาการซึมเศร้าเล็กน้อย" getmild
    getmild: async (req, res) => {
            const { startDate, endDate } = req.body;

            // แปลงเป็นวันที่
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); 

            try {
                const result = await patient.aggregate([
                    {
                        $lookup: {
                            from: "assessment9q",
                            localField: "_id",
                            foreignField: "pid",
                            as: "9Q"
                        }
                    },
                    { $unwind: "$9Q" },
                    {
                        $match: {
                            "9Q.score": { $gt: 7, $lte: 12 },
                            "9Q.assessmentdate": { $gte: start, $lte: end }
                        }
                    },
                    {
                        $count: "mildCount"
                    }
                ]);

                res.json(result[0] || { mildCount: 0 });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
            }
        },
     //นับจำนวนผู้ที่มี"อาการซึมเศร้าเล็กน้อย" getmild
    getcountmild: async (req, res) => {
        try {
            const result = await patient.aggregate([
            {
                $lookup: {
                from: "assessment9q",
                localField: "_id",
                foreignField: "pid",
                as: "9Q"
                }
            },
                { $unwind: "$9Q" }, // แปลง array เป็น document
            {
                $match: {
                "9Q.score": { $gt: 7, $lte: 12 }// score > 7 แต่ไม่เกิน 12 score <=12 
                }
            },
            {
                $group: {
                _id: null,
                count: { $sum: 1 }
                }
            }
            ]);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        }
    },
    getModerate: async(req, res)=>{
        try{
            const result = await patient.aggregate([
                {
                    "$lookup":{
                        "from":"assessment9q",
                        "localField":"_id",
                        "foreignField":"pid",
                        "as":"9Q"
                    }
                },
                {
                    "$match":{
                        "9Q.score":{ "$gt":13,"$lte":18 }
                    }
                }
            ]);
            res.json(result);
        }catch(err){
            res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        }
    },
    //จำนวนผู้ลงทะเบียนทั้งหมด
    getcontpatient: async (req, res)=>{
        try{
            const count = await patient.countDocuments();
            res.json({countpatient: count});
        }catch(err){
            res.status(500).json({ error:'เกิดข้อผิดผลาด' })
        }
    }
}
