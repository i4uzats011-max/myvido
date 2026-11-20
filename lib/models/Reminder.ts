import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReminder extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  isRecurring: boolean;
  recurringType: 'daily' | 'weekly' | 'monthly' | null;
  completed: boolean;
  createdAt: Date;
}

const ReminderSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  time: {
    type: String,
    default: '',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Reminder: Model<IReminder> =
  mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);
