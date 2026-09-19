const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(["1.1.1.1", "1.0.0.1"]); 
require('dotenv').config() 
const connectDB = async ()=>{
    try{
       await  mongoose.connect(process.env.MONGODB_URI);
       console.log('mongodb connected')
    }
    catch(error){
        console.error('❌ DB Error:', error.message)

    }
}

module.exports = connectDB