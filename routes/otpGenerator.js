const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const express = require('express');
const otpRouter = express.Router();

// // MongoDB connection URI (replace with your actual URI)
// const mongoURI = 'mongodb://localhost:27017/';  // Or connection string

// // Connect to MongoDB using Mongoose
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB (Mongoose)'))
//   .catch(err => {
//     console.error('Error connecting to MongoDB (Mongoose):', err);
//     // Handle the error appropriately, e.g., exit the application
//     process.exit(1); // Exit the process if the database connection fails
//   });

// Define the OTP schema using Mongoose
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '5m' }, // OTP expires after 5 minutes
});

// Create the OTP model
const OTP = mongoose.model('OTP', otpSchema);

// Function to generate OTP
function generateOTP() {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// Function to store OTP in MongoDB (using Mongoose)
async function storeOTP(email, otp) {
  try {
    // Delete any existing OTP for the email
    await OTP.deleteMany({ email: email });
    // Create a new OTP document
    const newOTP = new OTP({ email, otp });
    await newOTP.save();
    console.log('OTP stored in database (Mongoose)');
    return true;
  } catch (error) {
    console.error('Error storing OTP (Mongoose):', error);
    return false;
  }
}

// Function to send OTP via email
async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'varun.kumar.sharma.2365@gmail.com', // Replace with your email
      pass: 'mbjj bwlw hzzc fjpe',     // Replace with your app password
    },
  });

  const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Your One-Time Password (OTP)</h2>
            <p style="font-size: 16px; color: #555; margin-bottom: 25px;">
                Here is your OTP to verify your email address:
            </p>
            <div style="background-color: #007bff; color: white; padding: 15px 20px; border-radius: 8px; font-size: 24px; font-weight: bold; display: inline-block; margin-bottom: 25px;">
                ${otp}
            </div>
            <p style="font-size: 14px; color: #777; margin-bottom: 10px;">
                This OTP is valid for 5 minutes.
            </p>
            <p style="font-size: 14px; color: #777;">
                If you did not request this OTP, please ignore this email.
            </p>
        </div>
    `;

  const mailOptions = {
    from: 'varun.kumar.sharma.2365@gmail.com', // Replace with your email
    to: email,
    subject: 'OTP Verification',
    html: htmlTemplate,
  };


    const info = await transporter.sendMail(mailOptions);
    
    const storeSuccess = await storeOTP(email, otp); // Store OTP after sending
    if (!storeSuccess) {
      console.error('Failed to store OTP in database.');
      return false;
    }
    return true;
  
}

// Function to verify OTP (using Mongoose)
async function verifyOTP(email, otp) {

    const otpDocument = await OTP.findOne({ email: email, otp: otp });

    if (!otpDocument) {
      console.log('OTP not found or incorrect (Mongoose).');
      return false;
    }
    // If the OTP is found, it's automatically checked for expiration
    await OTP.deleteOne({ _id: otpDocument._id }); // Delete the OTP
    console.log('OTP verified and deleted (Mongoose).');
    return true;

}




// THE POST REQUEST FOR GETTING OTP
// PARAMS : {email}
// RESPONE : JSON : {validResponse : bool, message : String}
otpRouter.post('/getOtp',async(req, res)=>{
  try{

    var otp = generateOTP();
    var response = await sendOTP(req.body.email, otp);
    if(response){

      res.status(201).send({
        validResponse : true,
        message : `OTP Sent to ${req.body.email}`
      })
    }else{
      res.status(400).send({
        validResponse : false, 
        message : "Unable To Send OTP"
      })
    }

  }catch(e){
    res.status(501).send({
      validResponse : false,
      message : "Internal Server Error"
    })
  }
})


// THE POST REQUEST FOR VERIFYING OTP 
// PARAMS : {email : String} && {otp : String}
// RESPONSE : {validResponse : bool, message : String}
otpRouter.post('/verifyOtp', async(req, res)=>{
  try{

    var response = await verifyOTP(req.body.email, req.body.otp);
    if(response){
      res.status(201).send({
        validResponse : true, 
        message : "OTP Verified Successfully",
      })
    }
    else{
      res.status(400).send({
        validResponse : false, 
        message : "OTP Verification Failed. Please request a new OTP"
      })
    }
  }catch(e){
    res.status(501).send({
      validResponse : false, 
      message : "Internal Server Error"
    })
  }

});

module.exports = otpRouter;