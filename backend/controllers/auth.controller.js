import { HTTP_CODES } from '../config/constants.js';
import { User } from './../model/user-schema.js';



export const register = async (req, res) => {
    try{
        const { email, name, password, avatar } = req.body;
        const isUserExists = await User.findUserByemail(email);
        if(isUserExists){
            return res.status(HTTP_CODES.ALREADY_FOUND).json({
                message : "User Already Exists",
                user  : isUserExists,
            });
        }

        if(avatar){
            // User Uploaded Profile Pic as well , so need to Upload it 
            
        }

        // User is Not Existed 
        const user = {
            email , name , password , 
        }


    }catch(e){
        res.status(HTTP_CODES.SERVER_ERROR).json({
            message : "Something Went Wrong , Plase try again",
            user  : null
        })        
    }

}

export const login= async(req , res) => {

}

export const profile = async(req ,res) => {
    
}