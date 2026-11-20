import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'folder',
    },
    color: {
      type: String,
      default: '#ef4444',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in hot-reload
export const Folder: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);
