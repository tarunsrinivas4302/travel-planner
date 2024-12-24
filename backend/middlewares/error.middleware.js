import { HTTP_CODES } from "../config/constants.js";

export const errorHandler = (err, req, res, next) => {
    const statuscode = HTTP_CODES[res.statusCode] ? HTTP_CODES[res.statusCode] : HTTP_CODES.SERVER_ERROR;
    return res.status(statuscode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    })
}

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(HTTP_CODES.NOT_FOUND);
    next(error);
}