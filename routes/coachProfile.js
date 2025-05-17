const express = require('express');
const mongoose = require('mongoose');
const coachProfileRouter = express.Router();
const CoachPortfolio = require('../schema/CoachProfileSchema'); // Adjust the path if needed
// const CoachAuthSchema= require('../schema/CoachAuthSchema'); // Import Coach model - CHECK THIS PATH
const coachAuthSchema = require('../schema/CoachAuthSchema');
const CoachAuthCollection = mongoose.model('CoachAuth', coachAuthSchema, 'CoachAuth');





coachProfileRouter.get("/profile/:coachId", async (req, res) => {
    try {
      const coachId = req.params.coachId;
  
      // 1. Validate coachId
      const coachExists = await CoachAuthCollection.findById(coachId);
      if (!coachExists) {
        return res.status(400).json({ message: "Coach not found" });
      }
  
      // 2. Fetch the coach's portfolio
      const coachPortfolio = await CoachPortfolio.findOne({ coach: coachId });
  
      if (!coachPortfolio) {
        return res.status(404).json({ message: "Portfolio not found for this coach" });
      }
  
      // 3. Send the portfolio data
      res.status(200).json(coachPortfolio);
    } catch (error) {
      // 4. Handle errors
      console.error("Error fetching profile", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  });





  
coachProfileRouter.post("/profile/update", async (req, res) => {
    try {
        const { coachId } = req.body;

        console.log("Received coachId:", coachId);

        // 1. Validate coachId
        const coachExists = await CoachAuthCollection.findById(coachId);
        console.log("CoachExists:", coachExists);

        if (!coachExists) {
            return res.status(400).json({ message: 'Invalid coachId: Coach not found' });
        }

        // 2. Check if a portfolio exists for this coach
        let coachPortfolio = await CoachPortfolio.findOne({ coach: coachId });

        if (coachPortfolio) {
            // 3. If portfolio exists, update it
            // Create an object with all schema fields, defaulting to null
            const updateData = {
                coach: coachId, // Keep coachId
                name: null,
                email: null,
                mobile: null,
                headline: null,
                bio: null,
                specializations: null,
                certifications: null,
                experienceYears: null,
                profilePicture: null,
                gallery: null,
                videoEmbedUrl: null,
                leadMagnets: null,
                bookingOptions: {
                    isEnabled: null,
                    bookingLink: null,
                    availableSlots: null,
                },
                subCoaches: null,
                paymentDetails: {
                    paymentMethod: null,
                    accountDetails: null,
                },
                internalNotes: null,
                availabilityStatus: null,
                programsOffered: null,
                assignedLeads: null,
                updatedAt: Date.now()
            };

            // Copy values from req.body into the updateData object
            for (const key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                    updateData[key] = req.body[key];
                }
            }
            coachPortfolio = await CoachPortfolio.findOneAndUpdate({ coach: coachId }, updateData, {
                new: true,
                runValidators: true,
                upsert: true,
            });
            return res.status(200).json({ message: 'Portfolio updated successfully', portfolio: coachPortfolio });
        } else {
            // 4. If portfolio doesn't exist, create a new one
            const newCoachPortfolio = new CoachPortfolio({
                ...req.body,
                coach: coachId,
            });
            const savedPortfolio = await newCoachPortfolio.save();
            return res.status(201).json({ message: 'Portfolio created successfully', portfolio: savedPortfolio });
        }
    } catch (error) {
        // 5. Handle errors
        console.error("Error updating/creating profile", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        return res.status(500).json({ message: "Internal Server Error", error });
    }
});
module.exports = coachProfileRouter;


