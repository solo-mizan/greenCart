import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  firebaseUid: string;
  role: "user" | "admin";
  avatar?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  _id?: string;
  label: string;       // বাড়ি, অফিস
  street: string;
  area: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, required: true },
  street: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  postalCode: String,
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    firebaseUid: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: String,
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

// Index for fast lookups
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
