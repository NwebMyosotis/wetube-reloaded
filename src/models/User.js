import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  console.log("no hashed:", this.password);
  this.password = await bcrypt.hash(this.password, 5);
  console.log("hashed:", this.password);
});

const User = mongoose.model("User", userSchema);

export default User;
