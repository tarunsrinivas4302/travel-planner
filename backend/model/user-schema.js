import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = Schema({

    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email Must be Valid"],
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxLength: 128,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/,
    },
    trips: [{ type: Schema.Types.ObjectId, ref: "Trip" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    avatar: String,
    preferences: {
        currency: {
            type: String,
            default: "INR"
        },
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'light'
        },

    },
}, { timestamps: true })

UserSchema.index({ email: 1 }); // Unique by default
UserSchema.index({ username: 1 });
UserSchema.index({ "preferences.currency": 1 })


// Hash Password Before Saving
UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (e) {
        next(e);
    }

    next();
})


// Normalize Email
UserSchema.pre('save', function (next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    next();
});

//  Check is Passwords Valid or Not 
UserSchema.methods.isPasswordValid = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Removing Notifications and Trips of that Particular User ..
UserSchema.pre('remove', async function (next) {
    await this.model('Notification').deleteMany({ user: this._id });
    await this.model('Trip').deleteMany({ createdBy: this._id });
    next();
});



UserSchema.methods.findUserByemail = function (email) {
    return this.where({ email }, )
}

UserSchema.methods.findUserByID = function (id) {
    return this.where({ _id: id })
}

export const User = model('user', UserSchema);
