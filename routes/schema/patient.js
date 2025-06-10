var mongoose = require('../connect');
var patientSchema = new mongoose.Schema({
    cid:String,
    prefix:String,
    fname:String,
    lname:String,
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