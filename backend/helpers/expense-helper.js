export const processExpenses = async (expenses, tripid) => {
    try {
      const expenseObjects = await Promise.all(
        expenses.map(async (expense) => {
          const sharedByIDs = await User.findIDSByEmail(expense.sharedBy);
          const splitParticipantEmails =
            expense.splitDetails?.map((item) => item.participant) || [];
          const splitParticipantIDS = await User.findIDSByEmail(
            splitParticipantEmails
          );
  
          const paidBy = await User.findIDSByEmail(expense.paidBy);
          const normalizePaidBy = paidBy.map((item) => item._id.toString()) || [];
          const isValidParticipantID = splitParticipantIDS.every((item) =>
            isValidObjectID(item._id)
          );
  
          if (!isValidParticipantID) {
            throw new Error("Invalid Participant or Shared ID(s) provided.");
          }
  
          return {
            amount: expense.amount,
            category: expense.category,
            description: expense.description || null,
            paidBy: normalizePaidBy[0].toString(),
            sharedBy: sharedByIDs,
            trip: tripid.toString(),
            splitDetails: expense.splitDetails.map((item) => ({
              ...item,
              participant: splitParticipantIDS.find(
                (participant) => participant.email === item.participant
              ),
            })),
            currency: expense.currency || "INR",
          };
        })
      );
  
      const createdExpenses = await Expense.insertMany(expenseObjects);
      return { success: true, data: createdExpenses };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };