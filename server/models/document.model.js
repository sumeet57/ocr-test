import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: String,
  aadhaarNumber: String,
  dob: String,
  address: String,
  gender: String,
    phoneNumber: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", DocumentSchema);
