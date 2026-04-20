import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;          // snapshot at time of add
  name: string;
  image: string;
  unit: string;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    unit: { type: String, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

CartSchema.index({ user: 1 });

const Cart: Model<ICart> =
  mongoose.models.Cart ?? mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
