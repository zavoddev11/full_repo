const Message = require("./../models/message");

async function createMessage(messageData) {
  let websiteName = await chatWithGPT(messageData.sitedata, "What is the site name?")

  await Message.create({ ...messageData, websiteName });
}

async function getMessagesBySession(sessionId) {
  return await Message.find({ session_id: sessionId }).sort({ createdAt: 1 });
}

module.exports = {
  createMessage,
  getMessagesBySession,
};
