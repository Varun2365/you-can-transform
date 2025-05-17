const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define the storage strategy for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder where files will be stored
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        // Define the filename for the uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension); // e.g., 'myFile-1234567890.jpg'
    },
});

// Create the multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit (in bytes)
        // Add other limits as needed (e.g., file type, number of files)
    },
    fileFilter: (req, file, cb) => {
        // Optional: Filter files based on type, size, etc.
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Accept images
        } else {
            cb(new Error('Only images are allowed!'), false); // Reject other file types
        }
    },
});

// Define the file upload route
router.post('/upload', upload.single('myFile'), (req, res) => {
    // 'myFile' is the name attribute from the HTML form input element
    //  <input type="file" name="myFile">

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    // File information is available in req.file
    const { filename, path, size, mimetype } = req.file;

    // You can save file information to a database if needed
    // For example:
    // const newFile = new File({ filename, path, size, mimetype });
    // await newFile.save();

    res.status(200).json({
        message: 'File uploaded successfully!',
        file: {
            filename,
            path,
            size,
            mimetype,
            // Add a full URL if you want the client to be able to access it.
            url: `/uploads/${filename}`, //  Make sure your server can serve files from the 'uploads' directory
        },
    });
}, (error, req, res, next) => {
    // Error handling middleware for multer errors
    if (error instanceof multer.MulterError) {
        // A Multer error occurred (e.g., file size exceeded)
        res.status(400).json({ error: error.message });
    } else if (error) {
        // An error occurred during upload (e.g., file type error)
        res.status(400).json({ error: error.message });
    } else {
        // Handle other errors
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Serve uploaded files (optional, for development)
//  In a production environment, you'd configure your web server (e.g., Nginx, Apache)
//  to serve files from the 'uploads' directory.  This is for simple demonstration.
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define the route to retrieve a file
router.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        console.log(filePath)
        // Send the file
        res.sendFile(filePath);
    } else {
        // File not found
        res.status(404).json({ error: 'File not found' });
    }
});


module.exports = router;
