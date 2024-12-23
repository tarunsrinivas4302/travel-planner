import jsonwebtoken from 'jsonwebtoken';
import { HTTP_CODES } from '../config/constants';

export const authentication = (req ,res ,next) => {
    try{
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer') && authHeader.split(" ")[1];
    
        if (!token) {
          return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Token missing" });
        }
    
        // Verify the token
        jsonwebtoken.verify(token, process.env.jsonwebtoken_SECRET , (err, decoded) => {
          if (err || !decoded) {
            return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
          }
    
          // Attach the decoded user information to the request object
          req.user = decoded;
    
          next();
        });
    }catch(e){
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message : "Something Went Wrong"
        })
    }
}