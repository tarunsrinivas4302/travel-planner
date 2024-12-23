import { Schema , model } from "mongoose";
import { User } from "./user-schema";
const TripSchema = Schema({
    name : {
        type : String,
        required: true
    },
    destination : {
        type : String,
        required : true,
    },
    startDate : {
        type : Date,
        required : true,
    },
    endDate  :{
        type : Date,
        required : true,
    },
    participants : [{
        type : Schema.Types.ObjectId,
        ref : User,
    }],
    itineary : [{
        date : {
            type : Date, 
            required : true,
        },
        time : {    
            type : String, 
            required : true,
        },
        activity:{
            type : String,
            required : true,
        },
        location : {type : String}
    }],
    expenses :  [
        {
            type : Schema.Types.ObjectId,
            ref : "Expense",
        }
    ],
    status  : {
        type : String,
        default : "Planned",
        enum  : ["Planned" , "Ongoing" , "Completed"]
    },
    tripCoverImage : {
        type : String
    },
    createdBy :  {
        type: Schema.Types.ObjectId,
        ref  :User,
    }
} , {timestamps : true})




TripSchema.index({ createdBy: 1 });
TripSchema.index({ participants: 1 });
TripSchema.index({ status: 1 });
TripSchema.index({ createdBy: 1, status: 1 }); // Compound index


// Ensuring The Created By User is also Included in Participants Array
TripSchema.pre('save', async function(next){
    if(!this.participants.includes(this.createdBy)){
        this.participants.push(this.createdBy);
    }
    next();
})

// Ensuring Dates are match Exactly
TripSchema.pre('save', function (next) {
    if (this.endDate < this.startDate) {
        return next(new Error('End date must be after start date.'));
    }
    next();
});


//  Removing Expenses when trip is deleted 
TripSchema.pre('remove', async function (next) {
    await this.model('Expense').deleteMany({ trip: this._id });
    next();
});


export const Trip = model('trip' , TripSchema)