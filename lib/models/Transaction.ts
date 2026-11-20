import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountCategory = 'personal' | 'real' | 'nominal';
export type TransactionType =
  | 'given' // Dena / Diya (Loan given or payment made)
  | 'taken' // Lena / Liya (Loan taken or payment received)
  | 'income' // Nominal: Income earned
  | 'expense' // Nominal: Expense incurred
  | 'asset_add' // Real: Asset acquired (Cash/Property/Investment)
  | 'asset_reduce'; // Real: Asset disposed

export interface ITransaction extends Document {
  accountCategory: AccountCategory; // 'personal' | 'real' | 'nominal'
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD (देना कब है / लेना कब है)
  personId?: mongoose.Schema.Types.ObjectId;
  personName?: string;
  personMobile?: string;
  category?: string; // e.g., 'Consulting', 'Salary', 'Rent', 'Bank Account', 'Office Asset'
  description?: string;
  isSettled: boolean;
  settledAt?: Date | null;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  accountCategory: {
    type: String,
    enum: ['personal', 'real', 'nominal'],
    required: true,
    default: 'personal',
  },
  type: {
    type: String,
    enum: ['given', 'taken', 'income', 'expense', 'asset_add', 'asset_reduce'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  dueDate: {
    type: String,
    default: '',
    index: true,
  },
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    default: null,
  },
  personName: {
    type: String,
    default: '',
  },
  personMobile: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  description: {
    type: String,
    default: '',
  },
  isSettled: {
    type: Boolean,
    default: false,
  },
  settledAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
