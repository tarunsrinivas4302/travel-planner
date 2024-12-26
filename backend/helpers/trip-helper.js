import { HTTP_CODES } from "../config/constants.js";

export const ValidRequest =  (req) => {
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
      error  :true,
      message: "Missing Required Fields",
    }
  }

  // Checking For Valid Date Format
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return {
      error  :true,
      message: "Invalid Date Format",
    }
  }

  // Checking Is End Date is Greater than Start Date
  if (new Date(startDate) > new Date(endDate)) {
    return {
      error  :true,
      message: "End Date should be Greater than Start Date",
    }
  }

  //   Validating Itenary Object
  if (itineary) {
    itineary.forEach((item) => {
      if (!item.title || !item.time || !item.date) {
        if (!isValidDateFormat(item.date)) {
          return {
            error  :true,
            message: "Itineary Date is Invalid Format",
          }
        }
        return {
          error  :true,
          message: "Itineary Item Missing Required Fields",
        }
      }
    });
  }

  return {
    error : false,
    message: "Request is Valid",
    
  }
};

const isValidDateFormat = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
