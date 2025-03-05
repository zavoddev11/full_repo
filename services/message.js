import Message from "./../models/message.js";
import Session from "./../models/session.js";

export const createMessage = async function createMessage(data) {
  try {
    console.log({ data })

    let message = await Message.create({
      session_id: data.session_id,
      website_id: data.website_id,
      message: data.message,
      timeTaken: data.timeTaken,
      sender_type: data.sender_type,
      reply_to: data.reply_to
    })

    return message
  } catch (error) {
    console.log(error)
  }
}

export const getMessagesBySession = async function getMessagesBySession(sessionId) {
  return await Message.find({ session_id: sessionId }).sort({ createdAt: 1 });
}

export const getAllMessages = async function getMessagesBySession(sessionId) {
  return await Message.find()
}
