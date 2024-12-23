import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { s3Client } from "./aws-config.js"
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "./constants.js";

// Helper function for folder paths
const awsFolderNames = {
    getUserImageFolder: (username, userId) => `users/${username}-${userId}`,
    getTripImageFolder: (tripId) => `trips/${tripId}`,
};

// File filter for allowed types
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Allowed types are JPEG, PNG, GIF, and WEBP."));
    }
    cb(null, true);
};

// S3 Storage configuration
const s3Storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME || "",
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        try {
            // Get user or trip-related details
            const username = req.user?.username ?? "anonymous";
            const userId = req.user?.id ?? "unknown";
            const tripId = req.body?.tripId ?? "general";

            // Generate unique filename
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const fileExtension = path.extname(file.originalname);
            const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;

            // Determine folder path based on upload type
            let folderPath = "uploads/general";
            if (req.body.type === "user") {
                folderPath = awsFolderNames.getUserImageFolder(username, userId);
            } else if (req.body.type === "trip") {
                folderPath = awsFolderNames.getTripImageFolder(tripId);
            }
            const fullPath = `${folderPath}/${fileName}`;
            cb(null, fullPath);
        } catch (error) {
            cb(new Error(`Failed to generate file key: ${error.message}`));
        }
    },
});

// Configure Multer
const upload = multer({
    storage: s3Storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

// Export Upload Handlers
export const uploadFiles = {
    single: (fieldName) => upload.single(fieldName),
    multiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),
    fields: (fields) => upload.fields(fields),
};
