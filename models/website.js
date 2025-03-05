import mongoose from "mongoose"
// const { nanoid } = require('nanoid'); // Import NanoID


const websiteSchema = new mongoose.Schema({
    // unique_id: { type: String, default: () => nanoid(16), unique: true }, 
    websiteName: String,
    websiteLink: String,
    email: String,
    status: { type: String, enum: ["pending", "active", "interrupted", "closed"], default: "active" },
}, { timestamps: true });


const Website = mongoose.model.Session || mongoose.model("Website", websiteSchema)
export default Website
