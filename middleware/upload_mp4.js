const multer = require('multer');
const path = require('path');

const videoStorage = multer.diskStorage({
    destination: './uploads/videos/', // Destination to store video 
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const fileFilter = (req, file, cb) => {
    // upload only mp4 and mkv format
    if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
        return cb(new Error('Please upload a video'))
     }
     cb(undefined, true)
  };

const videoUpload = multer({
    storage: videoStorage,
    limits: {
    fileSize: 100000000 // 100000000 Bytes = 100 MB
    },
    fileFilter:fileFilter
});

module.exports = videoUpload;