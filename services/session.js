const Session = require("./../models/session");

async function createSession(sessionData) {
  return await Session.create(sessionData);
}

async function getSessionById(sessionId) {
  return await Session.findById(sessionId)
}

async function closeSession(sessionId) {
  return await Session.findByIdAndUpdate(
    sessionId,
    { status: "closed", endedAt: new Date() },
    { new: true }
  );
}

module.exports = {
  createSession,
  getSessionById,
  closeSession,
};
