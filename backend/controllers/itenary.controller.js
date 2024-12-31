export const addActivity = async (req, res) => {
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


export const deleteActivity = async (req, res) => {
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