import multer from "multer";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './constants.js'

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Allowed types are JPEG, PNG, GIF, and WEBP.'));
    }
    cb(null, true);
}
// const s3Storage = multerS3({
//     s3: s3Client,
//     bucket: process.env.AWS_BUCKET_NAME || '',
//     metadata: (req: Request, file: File, cb) => {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: (req: Request, file: File, cb) => {
//         try {
//             // Get user info from request (if provided)
//             const username = req.user?.username ?? 'anonymous';
//             const userId = req.user?.id ?? 'unknown';

//             // Generate unique filename
//             const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//             const fileExtension = path.extname(file.originalname);
//             const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;

//             // Generate full S3 path
//             const folderPath = awsFolderNames.getUserImageFolder(username, userId); // Assuming this returns a valid folder path
//             const fullPath = `${folderPath}/${fileName}`;

//             cb(null, fullPath);
//         } catch (error: any) {
//             cb(new Error(`Failed to generate file key: ${error.message}`));
//         }
//     },
// });
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
})


export const uploadFiles = {
    single: (fieldName) => upload.single(fieldName),
    multiple: (fieldName, maxCount) => upload.multiple(fieldName, maxCount),
    fields: (fields) => upload.fields(fields)

}