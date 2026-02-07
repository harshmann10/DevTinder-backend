const multer = require("multer");

const storage = multer.memoryStorage();

const fileUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
});

module.exports = fileUpload;