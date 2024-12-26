import { generatePresignedUrl } from "../config/aws-config.js";
import { HTTP_CODES } from "../config/constants.js";
import { ValidRequest } from "../helpers/trip-helper.js";
import { validateEmail } from "../helpers/utils.js";
import { Trip } from "../model/trip-schema.js";
import { User } from "../model/user-schema.js";

export const createTrip = async (req, res) => {
  try {
    const { id: userID } = req.user;
    console.log(userID);
    if (req.file && req.file.fieldname !== "trip-cover-image") {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "Please Provide a Valid File Name",
      });
    }
    // const {
    //   name,
    //   destination,
    //   startDate,
    //   endDate,
    //   participants: [useremails],
    //   itenary,
    //   status,
    // } = req.body;
    const {
      name,
      destination,
      startDate,
      endDate,
      participants = [], // Default to empty array if participants is missing
      itenary = [], // Default to empty array if itinerary is missing
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
      return res.status(HTTP_CODES.BAD_REQUEST).json(isValidReq.message);
    }
    // Validating Emails
    if (validateEmail(useremails)) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "All Particpants Should have a valid email",
      });
    }

    // If trip-cover-image is uploaded
    const tripCoverImage = req.file.key || null;

    const participantIDs = await User.findIDSByEmail(useremails);

    const isPendingUsersAvaliable = useremails.length !== participantIDs.length; // If both are not same then pending participants are avaliable

    let pendingParticipants = [];
    if (isPendingUsersAvaliable) {
      // Find emails of users who are not in the database (pending)
      pendingParticipants = useremails.filter(
        (email) => !participantIDs.some((user) => user.email === email)
      );
    }

    const trip = {
      name,
      destination,
      startDate,
      endDate,
      participants: Array.isArray(participantIDs)
        ? participantIDs
        : [participantIDs],
      pendingParticipants: pendingParticipants,
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

export const getTripDetails = async (req, res) => {};

export const updateTripDetails = async (req, res) => {};

export const deleteTripDetails = async (req, res) => {};
