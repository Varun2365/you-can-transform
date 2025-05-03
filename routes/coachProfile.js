const express = require('express');
const mongoose = require('mongoose');
const coachProfileRouter = express.Router();

coachProfileRouter.get("/profile", (req, res)=>{
    res.send("Profile Dashboard")
})

coachProfileRouter.post("/profile/update", (req, res)=>{
    res.send("Profile Dashboard update Page");
})

module.exports = coachProfileRouter