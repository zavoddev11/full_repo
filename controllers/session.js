import { getWebsiteById } from '../services/website.js';
import { createMessage } from './../services/message.js'
import sessionService, { getAllSessions } from './../services/session.js'

export async function createSession(req, res) {
  try {
    const sessionData = await req.body;
    console.log({ sessionData })

    const session = await sessionService.createSession(sessionData);
    const website = await getWebsiteById(sessionData.website_id);
    console.log({ website_name: website.websiteName })

    let message = await createMessage({
      message: `Welcome to ${website.websiteName} ! We're delighted to have you here, if you have any questions, feel free to ask!`,
      sender_type: "bot",
      session_id: session.id
    })

    console.log({ sessionData, session, message })

    res.status(201).json(session);


  } catch (error) {
    console.log({ error })
    res.status(500).json({ error: "Failed to create session." });
  }
}

export async function getSessionById(req, res) {
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

export async function getSessions(req, res) {
  try {
    const session = await getAllSessions();
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

export default {
  createSession,
  getSessions,
  getSessionById,
  closeSession,
};
