import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    picture: { type: String, default: "" },
    line_id: { type: String, required: true, unique: true },
    notify_token: { type: String },
    notify_count: { type: Number },
  },
  { versionKey: false },
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;

export interface IUser extends mongoose.Document, UserProps {}

export interface UserProps {
  name: string;
  email: string;
  picture: string;
  line_id: string;
  notify_token: string;
  notify_count: number;
}
