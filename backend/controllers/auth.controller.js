import { HTTP_CODES } from "../config/constants.js";
import { User } from "./../model/user-schema.js";
import { uploadFiles } from "../config/multer.js";
import { generatePresignedUrl } from "../config/aws-config.js";
// import { generatePresignedUrl } from '../config/aws-config.js';

export const register = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Logs form fields like name, email, etc.
    console.log("Uploaded File:", req.file); // Should log file info if upload is successful

    if (!req.file) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "File upload failed. Please try again.",
      });
    }

    const { email, name, password } = req.body;
    if (!name || !email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "All fields are required",
        user: null,
      });
    }

    const isUserExists = await User.findUserByemail(email);
    if (isUserExists.length > 0) {
      return res.status(HTTP_CODES.ALREADY_FOUND).json({
        message: "User Already Exists",
        user: isUserExists,
      });
    }

    let avatarUrl = null;
    if (req.file) {
      avatarUrl = req.file.key; // S3 KEY
    }

    // Create a new user
    const user = new User({
      email,
      username: name,
      password,
      avatar: avatarUrl,
    });

    await user.save();
    const s3Key = avatarUrl;
    user.avatar = await generatePresignedUrl(s3Key);
    res.status(HTTP_CODES.CREATED).json({
      message: "User registered successfully",
      user,
    });
  } catch (e) {
    console.log(e);
    res.status(HTTP_CODES.SERVER_ERROR).json({
      message: "Something went wrong, please try again.",
      user: null,
    });
  }
};

export const login = async (req, res) => {};

export const profile = async (req, res) => {};

export const updateProfile = async (req, res) => {};
