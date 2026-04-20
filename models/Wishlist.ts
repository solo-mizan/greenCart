import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWishlist extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1 });

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ?? mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
