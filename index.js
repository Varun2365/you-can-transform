const express = require('express')
const os = require('os');
const mongoose = require('mongoose');
const app = express();
const  connectDB = require('./config/db');
const coachAuthSchema = require('./schema/CoachAuthSchema');
const loginRouter = require('./routes/authRoute')
const otpRouter = require('./routes/otpGenerator');
const coachProfileRouter= require('./routes/coachProfile');
const uploadRouter = require('./routes/fileUpload');
const PORT = 8000;

// Connecting to the mongoDB
connectDB();

app.use(express.json());


app.use('/api/auth',loginRouter);
app.use('/', coachProfileRouter);
app.use('/', otpRouter);
app.use('/', uploadRouter);
app.get('/', (req, res)=>{
    res.send(`OS : ${os.platform()}\nCPU: ${os.cpus()[0]['model']}\nCores:${os.cpus().length}\n<h1>You Can Transform!</h1>`)
})
// Defining the collections




// Listening the app
app.listen(PORT, ()=>{
    console.log(`App Listening on ${PORT}`)
})