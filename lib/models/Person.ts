import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomField {
  label: string;
  value: string;
  isDate?: boolean;
}

export interface IRemarkEntry {
  recordedDate: string; // YYYY-MM-DD (Date note was created)
  dueDate?: string; // YYYY-MM-DD (Follow-up due date)
  note: string;
  syncAsTask?: boolean; // If true, automatically generates a task in Daily Tasks
  taskId?: string;
  completed?: boolean;
  createdAt?: Date;
}

export interface IPerson extends Document {
  name: string;
  mobile: string;
  email?: string;
  category: 'customer' | 'supplier' | 'friend' | 'family' | 'staff' | 'other';
  dob?: string; // YYYY-MM-DD (Birthdays auto-sync to Calendar)
  anniversary?: string; // YYYY-MM-DD (Anniversaries auto-sync to Calendar)
  address?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
  notes?: string;
  remarksHistory: IRemarkEntry[]; // Date-wise conversation / interaction history
  openingBalance: number; // Positive = Receivable (Lena), Negative = Payable (Dena)
  customFields: ICustomField[];
  createdAt: Date;
}

const CustomFieldSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    isDate: { type: Boolean, default: false },
  },
  { _id: false }
);

const RemarkEntrySchema = new Schema(
  {
    recordedDate: { type: String, required: true },
    dueDate: { type: String, default: '' },
    note: { type: String, required: true },
    syncAsTask: { type: Boolean, default: true },
    taskId: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PersonSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    enum: ['customer', 'supplier', 'friend', 'family', 'staff', 'other'],
    default: 'customer',
  },
  dob: {
    type: String,
    default: '',
  },
  anniversary: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  bankAccountNo: {
    type: String,
    default: '',
    trim: true,
  },
  ifscCode: {
    type: String,
    default: '',
    trim: true,
  },
  bankName: {
    type: String,
    default: '',
  },
  upiId: {
    type: String,
    default: '',
    trim: true,
  },
  notes: {
    type: String,
    default: '',
  },
  remarksHistory: {
    type: [RemarkEntrySchema],
    default: [],
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  customFields: {
    type: [CustomFieldSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Person: Model<IPerson> =
  mongoose.models.Person || mongoose.model<IPerson>('Person', PersonSchema);
