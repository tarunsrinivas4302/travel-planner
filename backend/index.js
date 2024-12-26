import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbconn } from "./config/dbconn.js";
import { HTTP_CODES } from "./config/constants.js";
import mongoose from "mongoose";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import {
  login,
  profile,
  register,
  removeUser,
  updateProfile,
} from "./controllers/auth.controller.js";
import { authentication } from "./middlewares/auth.middleware.js";
import {
  createTrip,
  deleteTripDetails,
  getTripDetails,
  updateTripDetails,
} from "./controllers/trips.controller.js";
import {
  addActivity,
  deleteActivity,
} from "./controllers/itenary.controller.js";
import {
  createExpense,
  deleteExpenses,
  getExpenses,
  updateExpenses,
} from "./controllers/expense.controller.js";
import { getNotifications } from "./controllers/notification.controller.js";
import { acceptInvite, inviteUser } from "./controllers/collab.controller.js";
import { uploadFiles } from "./config/multer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.BASE_URI || "*",
    credentials: true,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.set("toJSON", {
  virtuals: true, // this will convert _id to id
  versionKey: false,
  transform: (doc, ret) => {
    ret.password = undefined;
    return ret;
  },
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: http://localhost:${PORT}`);
  dbconn();
});

app.get("/", (req, res) => {
  res.write("Welcome to Travel-Planner ");
  res.end();
});

/**  Authentication Routes ... */
app.post("/api/auth/register", uploadFiles.single("avatar") , register);
app.post("/api/auth/login", login);
app.get("/api/auth/profile", authentication, profile);
app.put("/api/auth/update", authentication, uploadFiles.single("avatar") ,  updateProfile);
app.delete('/api/auth/delete-profile' , authentication , removeUser)

// Trip Management Routes
app.post("/api/trips/create-trip", authentication, uploadFiles.single("trip-cover-image") , createTrip); // Creates trip
app.get("/api/trips/:tripid", getTripDetails);
app.put("/api/trips/:tripid", authentication, updateTripDetails);
app.delete("/api/trips/:tripid", authentication, deleteTripDetails);

// Itenary Management
app.post("/api/trips/:tripid/itenary", authentication, addActivity);
app.delete(
  "/api/trips/:tripid/itenary/:activityid",
  authentication,
  deleteActivity
);

// expense Management
app.post("/api/trips/:tripid/expenses", authentication, createExpense);
app.get("/api/trips/:tripid/expenses", authentication, getExpenses);
app.put(
  "/api/trips/:tripid/expenses/:expenseId",
  authentication,
  updateExpenses
);
app.delete(
  "/api/trips/:tripid/expenses/:expenseId",
  authentication,
  deleteExpenses
);

// notifications
app.get("/api/notifications", authentication, getNotifications);

// Other endpoints might need
app.post("/api/trips/:tripid/invite", authentication, inviteUser);
app.put("/api/trips/:tripid/accept-invite", authentication, acceptInvite);

// MiddleWares
app.use(notFound);
app.use(errorHandler);
