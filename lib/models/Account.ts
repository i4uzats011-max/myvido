import mongoose, { Schema, Document, Model } from 'mongoose';

export type AccountType = 'personal' | 'real' | 'nominal';

export interface IAccount extends Document {
  name: string;
  accountType: AccountType;
  personId?: mongoose.Schema.Types.ObjectId; // If linked to a Person profile
  personMobile?: string;
  openingBalance: number; // Positive = Debit balance, Negative = Credit balance
  openingBalanceRemark?: string;
  description?: string;
  createdAt: Date;
}

const AccountSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  accountType: {
    type: String,
    enum: ['personal', 'real', 'nominal'],
    required: true,
  },
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    default: null,
  },
  personMobile: {
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
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
