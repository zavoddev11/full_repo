import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true,
    },
    website_id: String,
    reply_to: {
        required: false,
        type: String
    },
    session_id: String,
    sender_type: {
        type: String,
        default: "bot",
        enum: ["admin", "customer", "bot"]
    },
    timeTaken: {
        type: Number,
        required: false
    }
},
    {
        timestamps: true
    }
)
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message