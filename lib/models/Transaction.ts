import mongoose, { Schema, Document, Model } from 'mongoose';
import { AccountType } from './Account';

export interface ITransaction extends Document {
  debitAccountId: mongoose.Schema.Types.ObjectId;
  debitAccountName: string;
  debitAccountType: AccountType; // 'personal' | 'real' | 'nominal'
  creditAccountId: mongoose.Schema.Types.ObjectId;
  creditAccountName: string;
  creditAccountType: AccountType; // 'personal' | 'real' | 'nominal'
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD (देना कब है / लेना कब है - Auto syncs to Task Manager)
  narration?: string; // Description / Remarks
  personId?: mongoose.Schema.Types.ObjectId | null;
  personName?: string;
  personMobile?: string;
  isSettled: boolean;
  settledAt?: Date | null;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  debitAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  debitAccountName: {
    type: String,
    required: true,
  },
  debitAccountType: {
    type: String,
    enum: ['personal', 'real', 'nominal'],
    required: true,
  },
  creditAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  creditAccountName: {
    type: String,
    required: true,
  },
  creditAccountType: {
    type: String,
    enum: ['personal', 'real', 'nominal'],
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
  narration: {
    type: String,
    default: '',
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
