import { MulterError } from "multer"

export const multerErrorHandler = async(err , req ,res,next) => {

    
    if(err instanceof MulterError){
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({ error: 'File size is too large' });
            return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({ error: 'Too many files' });
            return;
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({ error: 'Unexpected field' });
            return;
        }
    }

    if (err.message === 'Invalid file type') {
        res.status(400).json({ error: 'Invalid file type' });
        return;
    }
    
    res.status(500).json({ error: 'Something went wrong' });
}