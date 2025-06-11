var express = require('express');
var router = express.Router();
var patient  = require('./controller/patient');
var assessment2q = require('./controller/assessment_2q');
var assessment9q = require('./controller/assessment_9q');
var user = require('./controller/user');

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
router.post('/registerpatient', (req, res, next)=>{ patient.regispatient(req, res); });
router.get('/getpatient', (req, res, next)=>{ patient.getpatient(req, res)});
router.get('/getpatass', (req, res, next)=>{ patient.getpatass(req, res);});

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

module.exports = router;
