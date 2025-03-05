import mongoose from "mongoose"

const SitedataSchema = new mongoose.Schema({
    // website_unique_id: String,
    website_id: String,
    website_name: { type: String, require: false },
    sitedata: { type: mongoose.Schema.Types.Mixed, default: [] }, // Can be an array or a string

}, { timestamps: true });

// Convert sitedata to a JSON string when retrieving the document
SitedataSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.sitedata = JSON.stringify(ret.sitedata);
        return ret;
    },
});


const Sitedata = mongoose.model.Session || mongoose.model("Sitedata", SitedataSchema)
export default Sitedata