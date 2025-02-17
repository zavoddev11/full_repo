const { getSessionById } = require("../services/session");
const { createMessage } = require("./../services/message");
const { chatWithGPT } = require("./ai_bot");
const { respondant_query } = require("./prompt/respondant");

module.exports = (io, socket) => {
    socket.on("message:send", async (data) => {
        let session_id = data.session_id
        console.log({ session_id })
        try {
            await createMessage(data)
            const sessionData = await getSessionById(session_id)
            let ai_query = respondant_query(sessionData.refinedSiteData.replace(/sitemap/gi, ""), JSON.stringify(sessionData.sitedata), data.message)
            let ai_reponse = await chatWithGPT(session_id, ai_query)
            io.emit("message:receive", { status: "success", data: { session_id, sender_type: "bot", message: ai_reponse.message } });
            await createMessage({ session_id, sender_type: "bot", message: ai_reponse.message })
        } catch (error) {
            console.log({ error })
            io.emit("message:receive", { status: "error", data: { session_id, sender_type: "bot", message: "We unable to process your message, please check your network" }, session_id });
        }
    });
    socket.in("connected:")
};
