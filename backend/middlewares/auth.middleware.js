import jsonwebtoken from 'jsonwebtoken';
import { HTTP_CODES } from '../config/constants.js';

export const authentication = (req, res, next) => {
  try {
    // Extract the Authorization header
    const authHeader = req.headers.authorization;

    // Ensure the header contains a Bearer token
    const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];
    if (!token) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({
        message: "Unauthorized: Token missing",
      });
    }

    // Verify the token
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        return res.status(HTTP_CODES.UNAUTHORIZED).json({
          message: "Unauthorized: Invalid token",
        });
      }

      // Attach the decoded payload to the request object
      req.user = decoded;

      // Pass control to the next middleware or route handler
      return next();
    });
  } catch (e) {
    // Catch any unexpected errors
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: "Something Went Wrong",
    });
  }
};
