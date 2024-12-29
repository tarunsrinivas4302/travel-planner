import { generatePresignedUrl } from "../config/aws-config.js";
import { HTTP_CODES } from "../config/constants.js";
import { processExpenses } from "../helpers/expense-helper.js";
import {
  makeTripData,
  mergeTripData,
  
  ValidRequest,
  ValidUpdateReq,
} from "../helpers/trip-helper.js";
import {
  isValidObjectID,
  validateEmail,
  validateExpenseSchema,
} from "../helpers/utils.js";
import { Expense } from "../model/expense-schema.js";
import { Trip } from "../model/trip-schema.js";
import { User } from "../model/user-schema.js";
import { createExpense } from "./expense.controller.js";

// * Creating A Trip
export const createTrip = async (req, res) => {
  try {
    const { id: userID } = req.user;
    console.log(userID);
    if (req.file && req.file.fieldname !== "trip-cover-image") {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Please Provide a Valid File Name",
      });
    }

    const {
      name,
      destination,
      startDate,
      endDate,
      participants = [],
      itenary = [],
      status,
    } = req.body;

    const useremails = participants; // Check if this array is not empty before accessing
    if (!useremails) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "At least one participant email is required",
      });
    }
    // if request is not valid send this response ....
    const isValidReq = ValidRequest(req);
    if (isValidReq.error) {
      const errmessage = isValidReq.message;
      return res.status(HTTP_CODES.BAD_REQUEST).json({ message: errmessage });
    }
    // Validating Emails
    if (!validateEmail(useremails)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "All Particpants Should have a valid email",
      });
    }
    // If trip-cover-image is uploaded
    const tripCoverImage = req.file?.key || null;
    const participantIDs = await User.findIDSByEmail(useremails);
    const isPendingUsersAvaliable = useremails.length !== participantIDs.length; // If both are not same then pending participants are avaliable
    let newPendingParticipants = [];
    if (isPendingUsersAvaliable) {
      // Find emails of users who are not in the database (pending)
      let pendingParticipants = useremails.filter(
        (email) => !participantIDs.some((user) => user.email === email)
      );
      newPendingParticipants = pendingParticipants.map((email) => {
        return { email: email };
      });
    }
    const trip = {
      name,
      destination,
      startDate,
      endDate,
      participants: Array.isArray(participantIDs)
        ? participantIDs
        : [participantIDs],
      pendingParticipants: newPendingParticipants,
      itenary: itenary,
      status,
      tripCoverImage,
      createdBy: userID,
    };

    // Saving in to Trip
    const savedTrip = await Trip.create(trip);
    if (savedTrip.tripCoverImage) {
      await generatePresignedUrl(savedTrip);
    }
    return res.status(HTTP_CODES.CREATED).json({
      message: "Trip Created Successfully",
      tripId: savedTrip.id || savedTrip._id,
      tripDetails: savedTrip,
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something Went Wrong",
    });
  }
};

// * Getting Trip Details

export const getTripDetails = async (req, res) => {
  try {
    const { tripid } = req.params;
    if (!tripid) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "No Trip ID is Mentioned",
      });
    }

    // Checks is it valid id or not
    if (!isValidObjectID(tripid)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid Trip ID has been Recieved",
      });
    }
    // Check In DB whether it existed or not
    const trip = await Trip.find(
      { _id: tripid },
      { pendingParticipants: 0 }
    ).populate("expenses");

    if (!trip || trip.length === 0) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "The Trip You're Looking For is Not Avaliable",
        tripDetails: null,
      });
    }

    return res.status(HTTP_CODES.SUCCESS).json({
      message: "Trip Details",
      tripDetails: trip,
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something Went Wrong , Please Try Again",
    });
  }
};

//  * Updating Trip Details
export const updateTripDetails = async (req, res) => {
  try {
    const { tripid } = req.params;
    const { updates } = req.body;

    // Validate trip ID
    if (!tripid) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid request: No Trip ID provided.",
      });
    }

    // Validate file input
    if (req.file && req.file.fieldname !== "trip-cover-image") {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid file: Please provide a valid file name.",
      });
    }

    // Validate request structure
    const isValidReq = ValidUpdateReq(updates);
    if (isValidReq?.error) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: isValidReq.message,
      });
    }

    // Process expenses
    let expensesData = [];
    if (updates?.expense) {
      const expenseValidation = validateExpenseSchema(updates.expense);
      if (expenseValidation.error) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          message: expenseValidation.message,
        });
      }

      const processedExpenses = await processExpenses(updates.expense, tripid);
      if (!processedExpenses.success) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          message: processedExpenses.message,
        });
      }
      expensesData = processedExpenses.data;
    }

    // Prepare trip data
    const tripData = makeTripData(updates);
    if (expensesData.length > 0) {
      tripData.expenses = expensesData.map((exp) => exp._id.toString());
    }

    // Find the trip
    const trip = await Trip.findById(tripid);
    if (!trip) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Trip not found.",
      });
    }

    // Merge new data into the trip
    mergeTripData(trip, tripData);

    // Save the updated trip
    const savedTrip = await trip.save();
    if (!savedTrip) {
      return res.status(HTTP_CODES.SERVER_ERROR).json({
        message: "Failed to update the trip. Please try again.",
      });
    }
    const fileKey = req.file?.key || null;
    const tripCoverImage = fileKey
      ? generatePresignedUrl(fileKey, process.env.IMAGE_EXPIRY)
      : null;
    savedTrip.tripCoverImage = tripCoverImage;
    return res.status(HTTP_CODES.SUCCESS).json({
      tripData: savedTrip,
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_CODES.SERVER_ERROR).json({
      message:
        error.message || "An unexpected error occurred. Please try again.",
    });
  }
};

// * Deleting Trip
export const deleteTripDetails = async (req, res) => {
  try {
    const { tripid } = req.params;
    if (!tripid) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Invalid request: No Trip ID provided.",
      });
    }
    const trip = await Trip.findByIdAndDelete(tripid);
    if (!trip) {
      return res.status(HTTP_CODES.NOT_FOUND).json({
        message: "The Trip You're Looking For is Not Avaliable",
      });
    }
    await Expense.deleteMany({trip : tripid})
    return res.status(HTTP_CODES.SUCCESS).json({
      message: "Trip Deleted Successfully...",
    });
  } catch (e) {
    console.log(e);
    return res.status(HTTP_CODES.SERVER_ERROR).json({
      message: e.message || "Something Went Wrong , Please Try Again",
    });
  }
};


