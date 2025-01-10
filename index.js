// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');


// Load environment variables
dotenv.config();


// Initialize app and constants
const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const MAX_FAILED_ATTEMPT = 5; // Total no of Failed attempts 
const TIME_DURATION = 600000; // Within 10 mins if same IP has 5 failed attempts

// Middleware to parse JSON requests
app.use(express.json());


// Database connection
mongoose.connect(MONGO_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));


// Define Schema and Model
const FailedRequestSchema = new mongoose.Schema({
   ip_address: String,
   timestamp: Date,
   failure_reason: String,
});
const FailedRequest = mongoose.model('FailedRequest', FailedRequestSchema);


// In-memory tracking for failed attempts
const failedAttempts = new Map();


// Nodemailer transporter setup
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD, 
    },
  });
  
  const sendEmail = async (ip) => {
    console.log(ip);

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: "dahiyapoojan1@gmail.com",
        subject: 'Alert: High Failed Request Activity',
        text: `The IP address ${ip} has exceeded the failed request threshold.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        return { status: 200, message: "Email sent successfully!" };
    } catch (error) {
        console.error('Error sending email:', error);
        return { status: 500, message: "Failed to send email", error };
    }
};


app.set('trust proxy', true);

// Route: Monitor POST requests
app.post('/api/submit', async (req, res) => {
   const ip = req.ip;
   const headers = req.headers;
   const accessToken = headers['authorization'];

   // Validate if there is valid token present or not
   if (!accessToken || accessToken !== 'valid-token') {
       const failureReason = !accessToken ? 'Missing token' : 'Invalid token';


       // Log the failed request
       await FailedRequest.create({
           ip_address: ip,
           timestamp: new Date(),
           failure_reason: failureReason,
       });


       // Update failed attempts in memory
       if (!failedAttempts.has(ip)) {
           failedAttempts.set(ip, []);
       }
       const timestamps = failedAttempts.get(ip);
       timestamps.push(Date.now());
       failedAttempts.set(ip, timestamps.filter(ts => Date.now() - ts <= TIME_DURATION));


       // Check if there are more than 5 request from same IP within 10 min
       if (timestamps.length >= MAX_FAILED_ATTEMPT) {
           // Send Email
           await sendEmail(ip);
           //Again Set Map to empty so we can track next 5 unvalid request from same IP
           failedAttempts.set(ip, []); 
       }


       return res.status(403).json({ message: 'Invalid request', reason: failureReason });
   }


   res.status(200).json({ message: 'Request successful' });
});


// Route: To Fetch metrics
app.get('/api/metrics', async (req, res) => {
   try {
       const metrics = await FailedRequest.find();
       res.status(200).json(metrics);
   } catch (error) {
       res.status(500).json({ message: 'Error fetching metrics', error });
   }
});


// Start the server
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

 
// const os = require('os');
// const cluster = require('cluster');
// const numCPUs = os.cpus().length;
// if (cluster.isMaster) {
//     // Fork workers
//     for (let i = 0; i < numCPUs; i++) {
//       cluster.fork();
//     }
// }