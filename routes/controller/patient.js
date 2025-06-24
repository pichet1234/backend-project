var mongoose = require('../connect');
var patient = mongoose.model('patient', require('../schema/patient'));

function convertThaiDate(input) {
    if (!input || typeof input !== 'string') return null;

    const [day, month, year] = input.split('/').map(Number);

    if (!day || !month || !year || year < 2400) return null; // ตรวจความถูกต้องคร่าวๆ

    const gregorianYear = year - 543;
    return new Date(gregorianYear, month - 1, day); // month เริ่มจาก 0
}

module.exports = {
    regispatient: async (req, res) => {
        try {
            const existing = await patient.findOne({ cid: req.body.cid });
            if(!existing){
                            // แปลง birthday จาก "01/08/2539" ➝ Date Object (ISO)
            const birthday = convertThaiDate(req.body.birthday);
                const result = await patient.create({
                    cid: req.body.cid,
                    prefix: req.body.prefix,
                    fname: req.body.fname,
                    lname: req.body.lname,
                    phone: req.body.phone,
                    birthday: birthday,
                    address: {
                        bannumber: req.body.banumber,
                        moo: req.body.moo,
                        subdistrict: req.body.subdistrict.name_th,
                        district: req.body.district.name_th,
                        province: req.body.province.name_th
                    },
                    latitude: req.body.latitude,
                    longitude: req.body.longitude
                });
        
                res.status(201).json({
                    message: 'ลงทะเบียนสำเร็จ',
                    data: result,
                });
            }else{
                return res.status(400).json({
                    message: 'ท่านเคยลงทะเบียนแล้ว',
                    patientId: existing._id
                });
            }
    
        } catch (err) {
            res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
                error: err.message
            });
        }
    },
    getpatient: (req, res)=>{
        patient.find({ }).then((result)=>{
            res.send(result)
        }).catch((err)=>{
            console.log(err)
        })
    },
    assfortwoq: async (req, res)=>{
        const { startDate, endDate } = req.body;
	
        // แปลงเป็นวันที่
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 
        try{
            const result = await patient.aggregate([
                {
                    "$lookup":{
                        "from":'assessment2q',
                        "localField":'_id',
                        "foreignField":'pid',
                        "as":'2Q'
                    }
                },
                {
                    "$unwind": "$2Q" 
                },
                {
                    "$match":{ "2Q.assessmentdate": { $gte: start, $lte: end }}
                }
            ]);
            res.json(result); // ส่งไปยัง frontend
        }catch(error){
            res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
                error: err.message
            });
        }
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
      getNotAssessed2Q: async (req, res)=>{
        try{
            const result = await patient.aggregate([
                {
                    $lookup: {
                      from: "assessment2q",
                      localField: "_id",
                      foreignField: "pid",
                      as: "2Q"
                    }
                  },
                  {
                    $match: {
                      $expr: { $eq: [{ $size: "$2Q" }, 0] }
                    }
                  }
              ]);
          
              res.json(result); // ส่งไปยัง frontend
        }catch(error){
            res.status(500).json({
                message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
                error: err.message
            });
        }
      },
    //ดึงรายชื่อตามเงื่อนไขทำแบบคัดกรอง 2Q และแบบสอบถาม 9Q แบ่งตาม lavel >=19
    getrad: async (req, res)=>{
            const { startDate, endDate } = req.body;
	
            // แปลงเป็นวันที่
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); 
        try{
       const result =  await patient.aggregate([{
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
                },{ $unwind: "$9Q" },
                {
                    "$match": { // เงื่อนไข score >= 19
                        "9Q.round": 1,
                        "9Q.score": { "$gte": 19 },
                        "9Q.assessmentdate": { $gte: start, $lte: end }
                    }
                }
            ]);
            res.json(result);
        }catch(err){

        }
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
                "9Q.round": 1,
                "9Q.score": { $gte: 19 }// score > 19
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
        const { startDate, endDate } = req.body;

        // แปลงเป็นวันที่
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 

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
                { $unwind: "$9Q" },
                {
                    $match:{
                        "9Q.round": 1,
                        "9Q.score":{ $gte: 13, $lte:18 },
                        "9Q.assessmentdate": { $gte: start, $lte: end }
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
                "9Q.round": 1,
                "9Q.score": { "$gte": 13, "$lte":18 }// score >= 13 แต่ไม่เกิน 18 score <=12 (คะแนน 13 – 18 = มีอาการซึมเศร้าปานกลาง ควรพบแพทย์ (ส้ม))
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
                            "9Q.round": 1,
                            "9Q.score": { $gt: 7, $lte: 12 },
                            "9Q.assessmentdate": { $gte: start, $lte: end }
                        }
                    }
                ]);

                res.json(result);
            } catch (err) {
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
                "9Q.round": 1,
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
    getpatientgreen:async(req, res)=>{
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
                    $unwind: "$9Q" 
                },
                {
                    "$match":{
                        "9Q.round": 1,
                        "9Q.score":{ "$lt":7 }
                    }
                }
            ]);
            res.json(result);
        }catch(err){
            res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
        }
    },
    getcountgreen: async (req, res) => {
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
                "9Q.round": 1,
                "9Q.score": { $lt: 7 }
              }
            },
            {
                $group: {
                _id: null,
                countgreen: { $sum: 1 }
                }
            }
          ]);
      
          // ถ้าไม่มีข้อมูล จะได้ array ว่าง []
          const count = result.length > 0 ? result[0].countgreen : 0;
      
          res.json({ countgreen: count });
      
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "เกิดข้อผิดพลาดในการนับผู้ป่วยสีเขียว" });
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
    },
    // followup
    followupmild: async (req, res)=>{
        try{
            const result = await patient.aggregate([
                {
                    $lookup: {
                      from: "assessment9q",
                      localField: "_id",
                      foreignField: "pid",
                      as: "assessment9q"
                    }
                  },{
                        $lookup:{
                            from:"followup",
                            localField:"_id",
                            foreignField:"pid",
                            as: "followup"
                        }		
                    },
                  {
                    $match: {
                      "9Q": {
                        $elemMatch: {
                          score: { $gt: 7, $lte: 12 }
                        }
                      }
                    }
                  }                
            ]);
            res.json(result);
        }catch(error){
            res.status(500).json({ error:'เกิดข้อผิดผลาด' })
        }
    }
}
