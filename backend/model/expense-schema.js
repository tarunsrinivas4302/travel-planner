import { Schema, model } from "mongoose";
import { User } from "./user-schema.js";
import { Trip } from "./trip-schema.js";

const ExpenseSchema = Schema(
  {
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
      required: true,
    },
    sharedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    description: {
      type: String,
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR"],
    },
    splitDetails: [
      {
        participant: Schema.Types.ObjectId,
        amountOwed: Number,
        status: {
          type: String,
          default: "PENDING",
          enum: ["PENDING", "COMPLETED"],
        },
      },
    ],
    settled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ trip: 1 });
ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ sharedBy: 1 });
ExpenseSchema.index({ trip: 1, paidBy: 1 });
// ExpenseSchema.index({ category: 1 }, { unique: true });
ExpenseSchema.index({ paidBy: 1, sharedBy: 1 });
ExpenseSchema.pre("save", function (next) {
  if (!this.sharedBy.includes(this.paidBy)) {
    this.sharedBy.push(this.paidBy);
  }
  next();
});

export const Expense = model("expense", ExpenseSchema);
