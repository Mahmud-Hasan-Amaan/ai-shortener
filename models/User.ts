import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
