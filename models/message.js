const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true,
    },
    session_id: String,
    sender_type: {
        type: String,
        default: "bot",
        enum: ["admin", "customer", "bot"]
    },
},
    {
        timestamps: true
    }
)
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

module.exports = Message