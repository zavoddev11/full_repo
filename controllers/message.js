const { getMessagesBySession, createMessage } = require("../services/message");


module.exports.getSessionMessages = async (req, res, next) => {
    try {
        let sessionID = await req.params.sessionID
        console.log({ sessionID })
        const messages = await getMessagesBySession(sessionID)

        return res.status(200).json(messages);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}

module.exports.createMessage = async (req, res, next) => {
    try {
        let messageData = req.body
        const message = await createMessage(messageData)
        console.log({ message })
        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}