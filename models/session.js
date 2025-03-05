import mongoose from "mongoose"

const SessionSchema = new mongoose.Schema({
    website_id: String,
    status: { type: String, enum: ["active", "closed"], default: "active" },
}, { timestamps: true });


const Session = mongoose.model.Session || mongoose.model("Session", SessionSchema)
export default Session



