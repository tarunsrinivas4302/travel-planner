import {Types} from 'mongoose'

export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (Array.isArray(email)) {
    return email.every(validateEmail);
  } else {
    return regex.test(email);
  }
};


export const isValidObjectID = id =>  Types.ObjectId.isValid(id)


export const  validateExpenseSchema = (data) => {
  // Need to Validate 
  if(!data){
    return {error : true , message : "The Expenses Data Can't be Empty"}
  }

  if(!data.amount || !data.category || !data.paidBy){
    return {error : true , message : "The Required Fields Can't be Empty"}
  }

  const isPaidBy = isValidObjectID(data?.paidBy);
  const trip = isValidObjectID(data?.trip);

  if(trip){
    return {error : true , message :  "Please Provide Valid Trip ID "}
  }

  if(isPaidBy){
    return {error : true , message : "Please Provide Valid Person That Paid the Bill"}
  }


  

  return {error : false , message : "Validation Success" , data  :data};

}