var mongoose = require('../connect');
var patientSchema = new mongoose.Schema({
    cid:{
        type: String,
        required: true,
        unique: true // เพื่อป้องกันข้อมูลซ้ำ
    },
    prefix:String,
    fname:String,
    lname:String,
    birthday: Date ,
    phone:String,
    address: {
        bannumber:String,
        moo:String,
        subdistrict:String, // ตำบล
        district:String, //อำเภอ
        province:String//จังหวัด
    },
    latitude:String,
    longitude:String
}, {collection:'patient'});

module.exports = patientSchema;