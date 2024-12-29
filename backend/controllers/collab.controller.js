export const inviteUser = async (req, res) => {};

export const acceptInvite = async (req, res) => {
  try {
    const { tripid } = req.params;

    if (!tripid) {
      return res.status(HTTP_CODES.BAD_REQUEST).json({
        message: "No Trip ID is mentioned",
      });
    }

    
  } catch (err) {
    console.log(err);
    return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while processing your request",
    });
  }
};
