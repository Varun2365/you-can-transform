const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coachPortfolioSchema = new Schema({
    coach: {
        type: Schema.Types.ObjectId,
        ref: 'CoachAuth', // Link to the main Coach model
        required: true,
        unique: true // One portfolio per coach
    },
    // --- Basic Identification & Contact (Overlaps with Coach model but kept here for clarity) ---
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },

    // --- Professional Details (Might be shared with leads) ---
    headline: { type: String, maxLength: 150, trim: true },
    bio: { type: String, maxLength: 1000, trim: true },
    specializations: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0 },
    profilePicture: { type: String },
    gallery: [{ type: String }],
    videoEmbedUrl: { type: String, trim: true },

    // --- Lead Magnets (Managed by the coach) ---
    leadMagnets: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, maxLength: 300, trim: true },
        fileUrl: { type: String, required: true, trim: true },
        coverImage: { type: String }
    }],

    // --- Appointment Booking Configuration (Internal Management) ---
    bookingOptions: {
        isEnabled: { type: Boolean, default: false },
        bookingLink: { type: String, trim: true }, // Link to external scheduling tool
        availableSlots: [{
            dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            startTime: String, // e.g., "09:00"
            endTime: String   // e.g., "10:00"
        }],
        // Potentially direct integration settings in the future
    },

    // --- Sub-Coach Management (Internal) ---
    subCoaches: [{
        type: Schema.Types.ObjectId,
        ref: 'Coach' // List of sub-coaches managed by this coach
    }],

    // --- Internal System Information (Not usually shared with leads directly) ---
    paymentDetails: {
        paymentMethod: { type: String, enum: ['paypal', 'bank_transfer', 'stripe'], default: 'bank_transfer' },
        accountDetails: Schema.Types.Mixed // Store account details based on payment method
    },
    internalNotes: { type: String, trim: true }, // For admin or internal coach notes
    availabilityStatus: { type: String, enum: ['available', 'busy', 'on_leave'], default: 'available' },

    // --- Links to other parts of the platform ---
    programsOffered: [{
        type: Schema.Types.ObjectId,
        ref: 'Program' // If you have a model for coaching programs
    }],
    assignedLeads: [{
        type: Schema.Types.ObjectId,
        ref: 'Lead' // If leads are directly assigned to coaches
    }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

coachPortfolioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const CoachPortfolio = mongoose.model('CoachPortfolio', coachPortfolioSchema, 'CoachPortfolio');

module.exports = CoachPortfolio;