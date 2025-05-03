const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/YouCanTransform");
        console.log("Database Connected");
    }
    catch(e){
        console.log(`ERROR CONNECTING TO DATABASE\n${e.message}`)
        process.exit(1);
    }
}

module.exports = connectDB;