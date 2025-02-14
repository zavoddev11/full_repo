const Message = require("./../models/message");
const { createMessage } = require("./../services/message");
const { chatWithGPT } = require("./ai_bot");

module.exports = (io, socket) => {
    socket.on("message:send", async (data) => {
        let session_id = data.session_id
        try {
            const newMessage = await createMessage(data)
            let ai_reponse = await chatWithGPT(session_id, newMessage.message)
            io.emit("message:receive", { status: "success", data: { session_id, sender_type: "bot", message: ai_reponse.message } });
        } catch (error) {
            console.log({ error })
            io.emit("message:receive", { status: "error", data: { message: "We couldn't process your message, Try later." }, session_id });
        }
    });
    socket.in("connected:")
};
