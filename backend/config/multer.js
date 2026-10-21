
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


const allowedExtensions = new Set([
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.txt'
]);

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.has(extension)) {
            cb(null, true);
        } else {
            cb(new Error(
                'Only PDF, DOC, DOCX, PPT, PPTX and TXT files are allowed.'
            ));
        }
    }
});


module.exports = upload;
