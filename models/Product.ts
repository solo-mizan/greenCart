import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  unit: string;            // কেজি, লিটার, পিস
  quantity: number;        // stock
  images: string[];
  category: Types.ObjectId;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  sku?: string;
  weight?: number;
  origin?: string;         // দেশী / বিদেশী
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    unit: { type: String, required: true, default: "কেজি" },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    weight: Number,
    origin: String,
  },
  { timestamps: true }
);

// Compound text search index
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
