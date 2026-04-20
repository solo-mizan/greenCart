import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;          // সবজি, ফল, দুগ্ধজাত
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: String,
    image: String,
    description: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1, sortOrder: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category ??
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
