import { getMessagesBySession, createMessage, getAllMessages } from "./../services/message.js";

export const getAllTheMessages = async (req, res, next) => {
    try {
        let id = await req.params.id
        console.log({ id })
        const messages = await getAllMessages()

        return res.status(200).json(messages);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}
export const getSessionMessages = async (req, res, next) => {
    try {
        let id = await req.params.id
        console.log({ id })
        const messages = await getMessagesBySession(id)

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}



export const createAMessage = async (req, res, next) => {
    try {
        let messageData = req.body
        const message = await createMessage(messageData)
        console.log({ message })
        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}


