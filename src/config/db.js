const mongoose = require('mongoose');
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