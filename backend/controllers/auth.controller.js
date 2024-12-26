import { HTTP_CODES } from "../config/constants.js";
import { User } from "./../model/user-schema.js";
import { deleteS3Object, generatePresignedUrl } from "../config/aws-config.js";
import jsonwebtoken from "jsonwebtoken";
import { validateEmail } from "../helpers/utils.js";

// Utility to validate email format


// Function to set a JWT token in cookies
const setCookie = (payload, res) => {
  const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    httpOnly: process.env.NODE_ENV === "production",
  });

  return token;
};

// User Registration
export const register = async (req, res) => {
  try {
    if (req.file && req.file.fieldname !== "avatar") {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid file upload. Please try again.",
      });
    }

    const { email, name, password } = req.body;

    if (!name || !email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "All fields are required",
        user: null,
      });
    }

    if (!validateEmail(email)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid email format",
        user: null,
      });
    }

    const isUserExists = await User.findUserByemail(email);
    if (isUserExists.length > 0) {
      const payload = {
        email: isUserExists.email,
        id: isUserExists.id || isUserExists._id,
        name: isUserExists.name,
      };

      const token = setCookie(payload, res);
      return res.status(HTTP_CODES.SUCCESS).json({
        message: "User already exists",
        user: isUserExists,
        token: token,
      });
    }

    const avatarUrl = req.file?.key || null;

    const user = new User({
      email,
      username: name,
      password,
      avatar: avatarUrl,
    });

    await user.save();

    if (avatarUrl) {
      user.avatar = await generatePresignedUrl(avatarUrl);
    }

    const payload = {
      email: user.email,
      id: user.id || user._id,
      name: user.username,
    };

    const token = setCookie(payload, res);

    return res.status(HTTP_CODES.CREATED).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (e) {
    console.error("Error during user registration:", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong. Please try again.",
      user: null,
    });
  }
};

// User Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid request: Email and password are required.",
        user: null,
      });
    }

    if (!validateEmail(email)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid email format",
        user: null,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "User not found",
        user: null,
      });
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({
        message: "Invalid credentials",
        user: null,
      });
    }

    const payload = {
      email: user.email,
      id: user.id || user._id,
      name: user.username,
    };

    const token = setCookie(payload, res);

    return res.status(HTTP_CODES.SUCCESS).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (e) {
    console.error("Error during user login:", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong. Please try again.",
      user: null,
    });
  }
};

// Fetch User Profile
export const profile = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);
    if (!user) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "User not found",
        user: null,
      });
    }
    if(user.avatar) {
      user.avatar = await generatePresignedUrl(user.avatar);
    }
    return res.status(HTTP_CODES.SUCCESS).json({ user });
  } catch (e) {
    console.error("Error fetching user profile:", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong. Please try again.",
      user: null,
    });
  }
};

// Update User Profile (To Be Implemented)
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const updates = req.body;

    // If User Uploads the File 
    if (req.file && req.file.fieldname !== "avatar") {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid file upload. Please try again.",
      });
    }
    
    const avatarUrl = req.file?.key || null;
    // updates?.avatar = avatarUrl;
    if (updates.avatar) {
      updates.avatar = avatarUrl;
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "User not found",
        user: null,
      });
    }
    if(user.avatar) {
      user.avatar = await generatePresignedUrl(user.avatar);
    }
    return res.status(HTTP_CODES.SUCCESS).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (e) {
    console.error("Error updating user profile:", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong. Please try again.",
      user: null,
    });
  }
};


export const removeUser = async (req, res) => {
  try{
    const {id} = req.user;
    const user = await User.findById(id);
    if(!user){
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "User not found",
        user: null,
      });
    }

    const avatarKey  = user.avatar;
    if(avatarKey){
      await deleteS3Object(avatarKey);
    }


    await User.findByIdAndDelete(id);

    return res.status(HTTP_CODES.SUCCESS).json({
      message: "User deleted successfully",
      user: null,
    });
  }catch(e){
    console.error("Error updating user profile:", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong. Please try again.",
      user: null,
    });
  }
}