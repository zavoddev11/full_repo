const mongoose = require("mongoose");
const { Schema } = mongoose;

const SessionSchema = new Schema({
    websiteName: String,
    sitedata: { type: Array },
    website: String,
    refinedSiteData: String,
    owner: String,
    status: { type: String, enum: ["active", "closed"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);



