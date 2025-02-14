const sessionService = require('../services/session');

async function createSession(req, res) {
  try {
    const sessionData = await req.body;

    console.log({ sessionData })
    const session = await sessionService.createSession(sessionData);

    console.log({ sessionData, session })

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to create session." });
  }
}

async function getSessionById(req, res) {
  try {
    const sessionId = req.params.id;
    const session = await sessionService.getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }
    res.json(session);
  } catch (error) {
    console.log({ error })
    res.status(500).json({ error: "Failed to fetch session." });
  }
}

async function closeSession(req, res) {
  try {
    const sessionId = req.params.id;
    const session = await sessionService.closeSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to close session." });
  }
}

module.exports = {
  createSession,
  getSessionById,
  closeSession,
};
