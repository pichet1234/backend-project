var express = require('express');
var router = express.Router();
var patient  = require('./controller/patient');
var assessment2q = require('./controller/assessment_2q');
var assessment9q = require('./controller/assessment_9q');
var user = require('./controller/user');
var followup = require('./controller/followup');

router.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader('Access-Control-Allow-Credentials',true);
  next();
}
);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SaveLile' });
});

/*
* ส่วนของผู้ป่วย patient
*/
router.post('/registerpatient', (req, res, next)=>{ patient.regispatient(req, res); });//ลงทะเบียน
router.get('/getpatient', (req, res, next)=>{ patient.getpatient(req, res)});//รายชื่อผู้ที่ลงทะเบียนทั้งหมด
router.get('/getgreen', (req, res, next)=>{ patient.getpatientgreen(req, res);});//ผู้ที่ไม่มีอาการซึมเศร้า (เขียว)
router.post('/getred', (req, res, next)=>{ patient.getrad(req, res); });//ผู้ที่มีอาการซึมเศร้ารุนแรง ควรพบจิตแพทย์ (แดง)
router.post('/getpatientmild', (req, res, next)=>{ patient.getmild(req, res); });//ผู้ที่มีอาการซึมเศร้าเล็กน้อย ( เหลือง )
router.post('/getmoderate', (req, res,next)=>{ patient.getmoderate(req, res);});//ผู้ที่มีอาการซึมเศร้าปานกลาง ควรพบแพทย์ (ส้ม)
router.get('/getpatass', (req, res, next)=>{ patient.getpatass(req, res);});//เช็คผู้ทำแบบประเมิน
router.get('/countred', (req, res, next)=>{ patient.countred(req, res);});//นับจำนวนสีแดง
router.get('/countmoderate', (req, res, next)=>{ patient.countmoderate(req,res);});//นับจำนวนสีส้ม
router.get('/getcountmild', (req, res, next)=>{ patient.getcountmild(req, res); });//นับจำนวนสีเหลือง
router.get('/getcountgreen', (req, res, next)=>{ patient.getcountgreen(req, res);});//นับจำนวนสีเขียว
router.get('/countpatient', (req, res, next)=>{ patient.getcontpatient(req, res);});//นับจำนวนผู้ที่ลงทะเบียนทั้งหมด
router.get('/notas2q', (req, res, next)=>{ patient.getNotAssessed2Q(req, res); });
router.post('/asstwoqui' ,(req, res, next)=>{ patient.assfortwoq(req, res);})//กรองและออกรายงาน
/**
 * user
 * */
router.post('/registeruser', (req,res,next)=>{ user.register(req,res)});
router.post('/login', (req, res, next)=>{ user.login(req, res);})
router.post('/forgot-password', (req, res, next)=>{ user.forgotpassword(req,res);});
router.post('/reset-password/:token', (req, res,next)=>{ user.resetpassword(req, res);});
router.get('/users', (req, res)=>{ user.getuser(req, res); });
/*
*แบบประเมิน 2q 9q 
*/  
router.post('/2q', (req,res, next)=>{ assessment2q.addaess(req, res); })
router.post('/9q' , (req, res, next)=>{ assessment9q.addaess(req, res); })

/**
 * followup
 */
router.post('/asfollow', (req, res, next)=>{ followup.savefollow(req, res); })

module.exports = router;
