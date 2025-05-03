const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const coachAuthSchema = require('../schema/CoachAuthSchema'); // Assuming your schema is in '../models'

// Create the CoachAuth model
const CoachAuthCollection = mongoose.model("CoachAuth", coachAuthSchema, "CoachAuth");

// Routes for Login Action
router.get('/login', (req, res) => {
    res.send("Login Page");
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await CoachAuthCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({
                validResponse: false,
                message: "Invalid credentials. User not found."
            });
        }

        // Compare the provided password with the stored password
        if (user.password !== password) {
            return res.status(401).json({
                validResponse: false,
                message: "Invalid credentials. Incorrect password."
            });
        }

        // If credentials are valid, send a success response
        res.status(200).json({
            validResponse: true,
            message: "Login successful."
            // You might want to include a token or user information here in a real application
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            validResponse: false,
            message: "Internal server error during login."
        });
    }
});

// Routes for Signup Action
router.get('/signup', (req, res) => {
    res.send("Signup Page");
});

// Uses headers  : {username}, {email}, {phoneNumber}, {password}
router.post('/signup', async (req, res) => {
    try {
        // Check if email or phoneNumber already exists
        const existingUser = await CoachAuthCollection.findOne({
            $or: [
                { email: req.body.email },
                { mobile: req.body.mobile }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                validResponse: false,
                message: "User with this email or phone number already exists."
            });
        }

        // If user doesn't exist, create a new user
        const newUser = await CoachAuthCollection.create(req.body);
        res.status(201).json({
            validResponse: true,
            message: "User created successfully."
        }); // Send a 201 Created status on successful creation
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            validResponse: false,
            message: "Internal server error during signup."
        }); // Handle other errors
    }
});

module.exports = router;