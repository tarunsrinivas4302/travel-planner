import { generatePresignedUrl } from "../config/aws-config.js";
import { HTTP_CODES } from "../config/constants.js";
import { makeTripData, ValidRequest, ValidUpdateReq } from "../helpers/trip-helper.js";
import { isValidObjectID, validateEmail, validateExpenseSchema } from "../helpers/utils.js";
import { Expense } from "../model/expense-schema.js";
import { Trip } from "../model/trip-schema.js";
import { User } from "../model/user-schema.js";


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
            newPendingParticipants = pendingParticipants.map(email => { return { email: email } })
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
                message: "No Trip ID is Mentioned"
            })
        }


        // Checks is it valid id or not
        if (!isValidObjectID(tripid)) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Trip ID has been Recieved"
            })
        }
        // Check In DB whether it existed or not 
        const trip = await Trip.findTripByID(tripid)

        if (!trip || trip.length === 0) {
            return res.status(HTTP_CODES.NOT_FOUND).json({
                message: "The Trip You're Looking For is Not Avaliable",
                tripDetails: null
            })
        }

        return res.status(HTTP_CODES.SUCCESS).json({
            message: "Trip Details",
            tripDetails: trip
        })

    } catch (e) {
        console.log(e);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: e.message || "Something Went Wrong , Please Try Again"
        })
    }
};

//  * Updating Trip Details 
export const updateTripDetails = async (req, res) => {
    try {
        const { tripid } = req.params;
        const { updates } = req.body;
        if (tripid) {
            return res.status(HTTP_CODES.BAD_REQUEST).json({
                message: "Invalid Request , No Trip ID Mentioned"
            })
        }

        const isValidReq = ValidUpdateReq(updates)
        if (isValidReq.error) {
            const errmessage = isValidReq.message;
            return res.status(HTTP_CODES.BAD_REQUEST).json({ message: errmessage });
        }

        // let expensesData = []; // 
        if (updates.expense) {
            const isValidExpenseSchema = validateExpenseSchema(updates.expense);
            if (isValidExpenseSchema.error) {
                return res.status(HTTP_CODES.BAD_REQUEST).json({
                    message : isValidExpenseSchema.message``
                })
            }
        }

        // It Will Create the Trip Data for Updates
        const tripdata = makeTripData(updates);
        console.log(tripdata);
        

    } catch (e) {
        console.log(e);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: e.message || "Something Went Wrong , Please Try Again"
        })
    }
};
 
export const deleteTripDetails = async (req, res) => {

    try {
        const { tripid } = req.params;
    } catch (e) {
        console.log(e);
        return res.status(HTTP_CODES.SERVER_ERROR).json({
            message: e.message || "Something Went Wrong , Please Try Again"
        })
    }
};
