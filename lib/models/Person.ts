import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactItem {
  label: string; // e.g. 'Primary Mobile', 'WhatsApp', 'Office', 'Home', 'Manager'
  number: string;
  isWhatsapp?: boolean;
}

export interface IProfileEntry {
  category: string; // e.g. 'KYC / Documents', 'Business Terms', 'Personal Info', 'Preferences', 'Other'
  key: string; // e.g. 'GSTIN', 'PAN', 'Credit Limit', 'Spouse Name', 'Preferred Delivery Slot'
  value: string;
  remarks?: string;
  date?: string; // Optional relevant date
}

export interface ICustomField {
  _id?: string;
  fieldType: 'date_task' | 'info'; // 'date_task' = Date, Amount, Tax, Remarks, Auto-Task; 'info' = Normal Profile Attribute
  fieldName: string; // Field Name / Title (किस चीज की डेट है or Info Label e.g. GSTIN, Payment Follow-up)
  details?: string; // Value or Details for normal info field
  date?: string; // Due / Event Date (YYYY-MM-DD)
  amount?: number; // Amount if applicable
  tax?: string; // Tax / GST details if applicable
  remarks?: string; // Remarks / Notes
  syncAsTask?: boolean; // Default true for date_task
  taskId?: string; // Synced Task ID
  completed?: boolean;
  createdAt?: Date;
  // Legacy compatibility
  label?: string;
  value?: string;
  isDate?: boolean;
}

export interface IRemarkEntry {
  recordedDate: string; // YYYY-MM-DD (Date note was created)
  dueDate?: string; // YYYY-MM-DD (Follow-up due date - triggers Task Manager)
  note: string;
  category?: string; // e.g. 'Payment Call', 'Meeting', 'Promise', 'General'
  syncAsTask?: boolean; // If true, automatically generates a task in Daily Tasks
  taskId?: string;
  completed?: boolean;
  createdAt?: Date;
}

export interface IPerson extends Document {
  name: string;
  mobile: string; // Primary phone
  contacts: IContactItem[]; // Multiple contacts list
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
  openingBalance: number; // Positive = Receivable (Lena), Negative = Payable (Dena)
  openingBalanceRemark?: string; // Remarks explaining previous opening balance
  profileEntries: IProfileEntry[]; // Non-transactional entries categorized in profile
  remarksHistory: IRemarkEntry[]; // Date-wise conversation & interaction history
  customFields: ICustomField[]; // Dynamic fields: Date Tasks (Date + Amount + Tax + Remarks) & Normal Info fields
  createdAt: Date;
}

const ContactItemSchema = new Schema(
  {
    label: { type: String, default: 'Mobile' },
    number: { type: String, required: true, trim: true },
    isWhatsapp: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProfileEntrySchema = new Schema(
  {
    category: { type: String, required: true, default: 'General' },
    key: { type: String, required: true },
    value: { type: String, required: true },
    remarks: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  { _id: false }
);

const CustomFieldSchema = new Schema(
  {
    fieldType: { type: String, enum: ['date_task', 'info'], default: 'info' },
    fieldName: { type: String, required: true, trim: true },
    details: { type: String, default: '' },
    date: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    tax: { type: String, default: '' },
    remarks: { type: String, default: '' },
    syncAsTask: { type: Boolean, default: true },
    taskId: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    // Legacy support
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    isDate: { type: Boolean, default: false },
  },
  { _id: true }
);

const RemarkEntrySchema = new Schema(
  {
    recordedDate: { type: String, required: true },
    dueDate: { type: String, default: '' },
    note: { type: String, required: true },
    category: { type: String, default: 'General' },
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
  contacts: {
    type: [ContactItemSchema],
    default: [],
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
  openingBalance: {
    type: Number,
    default: 0,
  },
  openingBalanceRemark: {
    type: String,
    default: '',
  },
  profileEntries: {
    type: [ProfileEntrySchema],
    default: [],
  },
  remarksHistory: {
    type: [RemarkEntrySchema],
    default: [],
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
