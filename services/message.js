const Message = require("./../models/message");

// async function createMessage(messageData) {
//   return await Message.create(messageData);
// }

async function createMessage(messageData) {

  // const sitename_quwery = await queru()

  // let websiteName = await chatWithGPT(messageData.sitedata, "What is the site name?")

  await Message.create({ ...messageData });
}

async function getMessagesBySession(sessionId) {
  return await Message.find({ session_id: sessionId }).sort({ createdAt: 1 });
}

module.exports = {
  createMessage,
  getMessagesBySession,
};
