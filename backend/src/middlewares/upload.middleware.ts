import multer from 'multer';
import os from 'os';

// Configure multer to use disk storage (prevents OOM for large files)
const storage = multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`);
    }
});

// Filter for video files only
const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'));
    }
};

// Filter for PDF files only
const pdfFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'));
    }
};

// Video upload (for topics)
export const upload = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
    },
});

// PDF upload (for PYQ)
export const pdfUpload = multer({
    storage: storage,
    fileFilter: pdfFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
});
