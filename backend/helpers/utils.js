import { Types } from "mongoose";
import { Trip } from "../model/trip-schema.js";

export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (Array.isArray(email)) {
    return email.every(validateEmail);
  } else {
    return regex.test(email);
  }
};

export const isValidObjectID = (id) => Types.ObjectId.isValid(id);

export const validateExpenseSchema = async (data) => {
  // Need to Validate
  if (!data) {
    return { error: true, message: "The Expenses Data Can't be Empty" };
  }

  if (!data.amount || !data.category || !data.paidBy) {
    return { error: true, message: "The Required Fields Can't be Empty" };
  }

  const isPaidBy = isValidObjectID(data?.paidBy);
  const trip = isValidObjectID(data?.trip);

  if (trip) {
    return { error: true, message: "Please Provide Valid Trip ID " };
  }

  if (isPaidBy) {
    return {
      error: true,
      message: "Please Provide Valid Person That Paid the Bill",
    };
  }

  if (data.sharedBy) {
    const isValidEmail = data.sharedBy.every((email) => validateEmail(email));
    let isValid;
    if (!isValidEmail) {
      return { error: true, message: "Please Provide Valid Shared Email(s)" };
    }
    if (Array.isArray(data.sharedBy)) {
      //  isValid = await Trip.findParticipants(data.sharedBy);
      isValid = data.sharedBy.filter(
        async (email) => await Trip.findParticipants(email)
      );
    } else {
      isValid = await Trip.findParticipants(data.sharedBy);
    }

    if (!isValid) {
      return {
        error: true,
        message: "Please Provide Email(s) that are included in the Trip",
      };
    }
  }
  if (data.currency) {
    const AcceptingCurrencies = ["INR", "USD", "EUR"];
    if (!AcceptingCurrencies.includes(data.currency)) {
      return { error: true, message: "Please Provide Valid Currency" };
    }
  }

  return { error: false, message: "Validation Success", data: data };
};
