import { Schema, model } from 'mongoose';
import { User } from './user-schema';

const NotificationSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

NotificationSchema.index({ user: 1 });
NotificationSchema.index({ isRead: 1 });


export const Notification = model('notifications', NotificationSchema);