import { HTTP_CODES } from "../config/constants.js";
import { User } from "./../model/user-schema.js";
import { generatePresignedUrl } from "../config/aws-config.js";
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const validateEmail = email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);



const setCookie = (payload, res) => {

  const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });


  // Set JWT token in cookies
  res.cookie("token", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Lax for local testing
    httpOnly: process.env.NODE_ENV === "production"
  });
  return token;
}

export const register = async (req, res) => {
  try {

    // Check if the uploaded file is invalid
    if (req.file && req.file.fieldname !== "avatar") {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid file upload. Please try again.",
      });
    }

    const { email, name, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "All fields are required",
        user: null,
      });
    }

    if (!validateEmail(email)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Email is not Valid",
        user: null
      })
    }



    // Check if the user already exists
    const isUserExists = await User.findUserByemail(email);
    if (isUserExists.length > 0) {
      const payload = {
        email: isUserExists.email,
        id: isUserExists.id || isUserExists._id,
        name: isUserExists.name,
      };

      const token = setCookie(payload, res);
      return res.status(HTTP_CODES.SUCCESS).json({
        message: "User Already Exists",
        user: isUserExists,
        token: token
      });
    }

    // Get the S3 key if a file is uploaded
    const avatarUrl = req.file?.key || null; // Use the file key if available, else null

    // Create a new user
    const user = new User({
      email,
      username: name,
      password,
      avatar: avatarUrl, // Save the S3 key in the database
    });

    await user.save();

    // Generate a presigned URL for the avatar (optional if no file uploaded)
    if (avatarUrl) {
      user.avatar = await generatePresignedUrl(avatarUrl);
    }

    const payload = {
      email: email,
      id: user.id || user._id,
      name: user.name,
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
      message: e.message || "Something went wrong, please try again.",
      user: null,
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid Request",
        user: null
      })
    }

    if (!validateEmail(email)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Email is not Valid",
        user: null
      })
    }

    const user = await User.findUserByemail(email);

    if (!user) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "User Not Found",
        user: null
      })
    }

    const isEqualPasswords = User.isPasswordValid(password);

    if (!isEqualPasswords) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({
        message: "Invalid email or password",
        user: null,
      });
    }
    if (user && isEqualPasswords) {
      const payload = {
        email: user.email,
        id: user.id || user._id,
        name: user.name
      }
      const token = setCookie(payload, res);
      if (!token) {
        throw new Error("Unable To Create a Token");
      }

      res.status(HTTP_CODES.SUCCESS).json({
        message: "User Logged In Successfully",
        user: user,
        token: token
      })
    }
  } catch (e) {
    console.error("Error during user Login :", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong, please try again.",
      user: null,
    });
  }
};

export const profile = async (req, res) => {
  try {
    console.log(req.user);
    const { id: UserID } = req.user;
    console.log(id , UserID);
    const user = User.findUserByID(UserID);
    console.log(user);
    if (!user) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "User Not Found",
        user: null,
      })
    }
    return res.status(HTTP_CODES.SUCCESS).json({ user })

  } catch (e) {
    console.error("Error during user registration:", e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something went wrong, please try again.",
      user: null,
    });
  }
};

export const updateProfile = async (req, res) => { };

