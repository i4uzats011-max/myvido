import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedVideo extends Document {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  duration: string;
  durationSec: number;
  viewCount: string;
  publishedAt: string;
  folderIds: string[]; // Folder ObjectIds or slugs
  notes: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedVideoSchema: Schema = new Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    channelTitle: {
      type: String,
      default: '',
    },
    channelId: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '0:00',
    },
    durationSec: {
      type: Number,
      default: 0,
      index: true,
    },
    viewCount: {
      type: String,
      default: '0',
    },
    publishedAt: {
      type: String,
      default: '',
    },
    folderIds: {
      type: [String],
      default: [],
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SavedVideo: Model<ISavedVideo> =
  mongoose.models.SavedVideo || mongoose.model<ISavedVideo>('SavedVideo', SavedVideoSchema);
