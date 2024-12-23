import { Schema, model } from 'mongoose';
import { User } from './user-schema';
import { Trip } from './trip-schema';

const ExpenseSchema = Schema({
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    paidBy: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    sharedBy: [{
        type: Schema.Types.ObjectId,
        ref: User
    }],
    trip: {
        type: Schema.Types.ObjectId,
        ref: Trip
    },
    description: {
        type: String,
    },
    currency: {
        type: String,
        default: "INR",
        enum: ["INR", "USD", "EUR"]
    },
    settled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

ExpenseSchema.index({ trip: 1 });
ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ sharedBy: 1 });
ExpenseSchema.index({ trip: 1, paidBy: 1 }); // Compound index



ExpenseSchema.pre('save', function (next) {
    if (!this.sharedBy.includes(this.paidBy)) {
        this.sharedBy.push(this.paidBy);
    }
    next();
});


export const Expense = model("expense", ExpenseSchema); 