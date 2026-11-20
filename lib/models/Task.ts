import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskPriority =
  | 'urgent-important' // Q1: Urgent & Important (Red by default)
  | 'urgent-not-important' // Q2: Urgent but Not Important (Orange by default)
  | 'important-not-urgent' // Q3: Important but Not Urgent (Yellow by default)
  | 'not-urgent-not-important' // Q4: Not Urgent & Not Important (Green by default)
  | 'important'
  | 'urgent'
  | 'less-important'
  | 'less-urgent';

export interface ITask extends Document {
  title: string;
  description: string;
  priority: TaskPriority;
  customColor?: string;
  completed: boolean;
  completedAt: Date | null;
  date: string;
  dueDate?: string;
  isRoutine: boolean;
  routineFrequency: 'daily' | 'weekly' | 'monthly' | null;
  personId?: string;
  personName?: string;
  amount?: number;
  tax?: string;
  sourceType?: 'manual' | 'person_field' | 'ledger_due';
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    enum: [
      'urgent-important',
      'urgent-not-important',
      'important-not-urgent',
      'not-urgent-not-important',
      'important',
      'urgent',
      'less-important',
      'less-urgent',
    ],
    default: 'urgent-important',
  },
  customColor: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  dueDate: {
    type: String,
    default: '',
  },
  isRoutine: {
    type: Boolean,
    default: false,
  },
  routineFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null,
  },
  personId: {
    type: String,
    default: '',
    index: true,
  },
  personName: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: String,
    default: '',
  },
  sourceType: {
    type: String,
    default: 'manual',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
