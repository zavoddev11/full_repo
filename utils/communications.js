import { getSessionById } from "./../services/session.js";
import { createMessage } from "./../services/message.js";
import { chatWithGPT } from "./ai_bot.js";
import { respondant_query } from "./prompt/respondant.js";
import { scrapeWebsite } from "./sitedata.js";
import Sitedata from "./../models/sitedata.js";
import price_data from "./new_data.js"
import Message from "../models/message.js";
import { getWebsiteById } from "../services/website.js";


export default (io, socket) => {
    socket.on("send:close", async (session_id) => {
        console.log({ session_id })
        socket.emit("send:switch", { session_id: session_id })
    })

    socket.on("message:send", async (data) => {
        socket.emit("message", { status: "success" });
        const { session_id, message: userMessage, website_id, } = data;

        let reply_to = "";
        const startTime = Date.now(); // Capture start time

        try {
            const message = await createMessage(data);
            console.log({ session_id, message });

            if (message) {
                reply_to = message._id;

                const siteData = await Sitedata.find({ website_id })
                const previous_messages = await Message.find({ session_id })
                    .sort({ createdAt: -1 })  // Sorting messages by creation date in descending order (latest first)
                    .limit(20);

                let complete_data

                if (website_id === "67c093e44b6e3ee3a8a1fa84") {
                    complete_data = JSON.stringify(siteData).substring(0, 509673) + price_data
                } else {
                    complete_data = JSON.stringify(siteData).substring(0, 509673)
                }

                let ai_query = respondant_query(
                    complete_data
                );

                let ai_response = await chatWithGPT(website_id, session_id, ai_query, previous_messages, userMessage);

                const botMessage = {
                    session_id,
                    sender_type: "bot",
                    message: ai_response.message,
                };

                socket.emit("message:receive", { status: "success", data: botMessage });

                const endTime = Date.now();
                const timeTaken = endTime - startTime;
                console.log({ timeTaken })

                let sent_message = await createMessage({ ...botMessage, website_id, reply_to, timeTaken });
                console.log({ session_id, sent_message });
            }
        } catch (error) {
            console.log({ error });

            const endTime = Date.now();
            const timeTaken = endTime - startTime;

            const errorMessage = {
                session_id,
                sender_type: "bot",
                message: "We are unable to process your message, please check your network",
                reply_to,
                timeTaken,
            };

            socket.emit("message:receive", { status: "error", data: errorMessage });
            await createMessage(errorMessage);
        }
    });

    socket.on("create:website", async (id) => {
        console.log("recieved", id)
        let website = await getWebsiteById(id)
        await scrapeWebsite(website.websiteLink, website._id)
    });

    socket.on("connect", () => {
        console.log("Client connected:", socket.id);
    });
};
