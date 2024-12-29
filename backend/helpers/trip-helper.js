import { HTTP_CODES } from "../config/constants.js";
import { Expense } from "../model/expense-schema.js";
import { User } from "../model/user-schema.js";
import { isValidObjectID } from "./utils.js";

export const ValidRequest = (req) => {
  const {
    name,
    destination,
    startDate,
    endDate,
    participants,
    expenses,
    status,
    itineary,
  } = req.body;

  const emails = participants;
  // Checking For Mandatory Fields
  if (!name || !destination || !startDate || !endDate || !emails) {
    return {
      error: true,
      message: "Missing Required Fields",
    };
  }

  // Checking For Valid Date Format
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return {
      error: true,
      message: "Invalid Date Format",
    };
  }

  // Checking Is End Date is Greater than Start Date
  if (new Date(startDate) > new Date(endDate)) {
    return {
      error: true,
      message: "End Date should be Greater than Start Date",
    };
  }

  //   Validating Itenary Object
  if (itineary) {
    itineary.forEach((item) => {
      if (!item.title || !item.time || !item.date) {
        if (!isValidDateFormat(item.date)) {
          return {
            error: true,
            message: "Itineary Date is Invalid Format",
          };
        }
        return {
          error: true,
          message: "Itineary Item Missing Required Fields",
        };
      }
    });
  }

  return {
    error: false,
    message: "Request is Valid",
  };
};

const isValidDateFormat = (date) =>
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date);

export const ValidUpdateReq = (updates = {}) => {
  if (updates.length === 0) {
    return { error: true, message: "Updates Object is Empty " };
  }

  return { error: false, message: "" };
};

export const makeTripData = (updates) => {
  const allowedKeys = [
    "name",
    "destination",
    "startDate",
    "endDate",
    "status",
    "itineary",
    "participants",
    "expenses",
  ];
  const tripData = {};

  for (const key of allowedKeys) {
    if (updates[key]) {
      // Directly assign if the key is valid and data exists
      if (key === "itineary" || key === "participants" || key === "expenses") {
        tripData[key] = Array.isArray(updates[key]) ? [...updates[key]] : [];
      } else {
        tripData[key] = updates[key];
      }
    }
  }

  return tripData;
};



// Helper function to merge trip data
export const mergeTripData = (trip, newData) => {
  // Append array fields
  if (newData.expenses) {
    trip.expenses = [...(trip.expenses || []), ...newData.expenses];
  }

  if (newData.itineary) {
    trip.itineary = [...(trip.itineary || []), ...newData.itineary];
  }

  if (newData.participants) {
    trip.participant = [...(trip.participants || []), ...newData.participants];
  }

  // Update non-array fields
  for (const key in newData) {
    if (!["expenses", "itineary", "participants"].includes(key)) {
      trip[key] = newData[key];
    }
  }
};
