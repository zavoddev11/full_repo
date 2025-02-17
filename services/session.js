const { chatWithGPT } = require("../utils/ai_bot");
const { company_detail_prompt } = require("../utils/prompt/summary");
const Session = require("./../models/session");
const { sitename_query } = require("../utils/prompt/sitename")

async function createSession(sessionData) {

  const use_sitename_query = sitename_query(JSON.stringify(sessionData.sitedata), "What is the name of this website?")
  const company_detail = company_detail_prompt(JSON.stringify(sessionData.sitedata))

  console.log({ use_sitename_query })

  let websiteName = (await chatWithGPT(sessionData.sitedata, use_sitename_query)).message
  let company_details = (await chatWithGPT(sessionData.sitedata, company_detail)).message

  let fullData = {
    ...sessionData, websiteName, refinedSiteData: company_details,
  }

  console.log({ websiteName })

  return await Session.create(fullData);
}

async function getSessionById(sessionId) {
  return await Session.findById(sessionId)
}

async function getAllSessions() {
  return await Session.find()
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
  getAllSessions
};
