import { HTTP_CODES } from "../config/constants.js";
import { processExpenses } from "../helpers/expense-helper.js";
import { validateExpenseSchema } from "../helpers/utils.js";
import { Expense } from "../model/expense-schema.js";
import { Trip } from "../model/trip-schema.js";

export const createExpense = async (req, res) => {
    try {
        const { tripid } = req.params;
        if (!tripid) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No Trip ID is Recieved ..."
            })
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Request Body Can't be Empty"
            })
        }

        const expenseValidation = validateExpenseSchema(req.body);
        if (expenseValidation.error) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: expenseValidation.message,
            });
        }

        const processedExpenses = await processExpenses(req.body.expenses, tripid);
        if (!processedExpenses.success) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: processedExpenses.message,
            });
        }
        const expensesData = processedExpenses.data;

        if (expensesData) {
            const tripData = {};
            if (expensesData.length > 0) {
                tripData.expenses = expensesData.map((exp) => exp._id.toString());
            }

            const trip = await Trip.findById(tripid);
            if (!trip) {
                return res.status(HTTP_CODES.BAD_REQUEST).json({
                    message: "Trip not found.",
                });
            }
            trip.expenses = [...(trip.expenses || []), ...tripData.expenses];
            console.log(trip);
            const savedTrip = await trip.save();
            if (!savedTrip) {
                return res.status(HTTP_CODES.SERVER_ERROR).json({
                    message: "Failed to update the Expense(s) in trip. Please try again.",
                });
            }
            return res.status(HTTP_CODES.CREATED).json({
                message: "Expense Created Successfully for this Trip ID ",
                data: expensesData
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: err.message || "Sorry , Something Went Wrong , Please Try Again"
        })
    }
}


export const getExpenses = async (req, res) => {
    try {
        const { tripid } = req.params;
        if (!tripid) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No Trip ID is Recieved ..."
            })
        }



    } catch (err) {
        console.log(err);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: err.message || "Sorry , Something Went Wrong , Please Try Again"
        })
    }
}


export const getSingleExpense = async (req, res) => {
    try {
        const { tripid, expenseId } = req.params;
        if (!tripid) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No Trip ID is Recieved ..."
            })
        }
        if (!expenseId) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No ExpenseID  ID is Recieved ..."
            })
        }


        const query = {
            $and: [
                { trip: tripid },
                { _id: expenseId }
            ]
        }

        const expense = await Expense.findOne(query, options);
        console.log(expense);
        res.end();
    } catch (err) {
        console.log(err);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: err.message || "Sorry , Something Went Wrong , Please Try Again"
        })
    }
}

export const updateExpenses = async (req, res) => {
    try {
        const { tripid, expenseId } = req.params;
        if (!tripid) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No Trip ID is Recieved ..."
            })
        }
        if (!expenseId) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No ExpenseID  ID is Recieved ..."
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: err.message || "Sorry , Something Went Wrong , Please Try Again"
        })
    }
}

export const deleteExpenses = async (req, res) => {
    try {
        const { tripid, expenseId } = req.params;
        if (!tripid) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No Trip ID is Recieved ..."
            })
        }
        if (!expenseId) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No ExpenseID  ID is Recieved ..."
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: err.message || "Sorry , Something Went Wrong , Please Try Again"
        })
    }
}