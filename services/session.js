import { chatWithGPT } from "../utils/ai_bot.js"
import { data } from "./../data/data.js" 
import { company_detail_prompt } from "../utils/prompt/summary.js"
import Session from "./../models/session.js"
import { sitename_query } from "./../utils/prompt/sitename.js"

export const createSession = async function (sessionData) {

  const use_sitename_query = sitename_query(JSON.stringify(sessionData.sitedata), "What is the name of this website?")

  console.log({ use_sitename_query })

  let websiteName = "web site"
  let company_details = "web site"

  let fullData = {
    ...sessionData, sitedata: data, websiteName, refinedSiteData: company_details,
  }

  console.log({ websiteName })

  return await Session.create(fullData);
}

export const getSessionById = async function (sessionId) {
  return await Session.findById(sessionId)
}

export const getAllSessions = async function () {
  return await Session.find()
}

export const closeSession = async function (sessionId) {
  return await Session.findByIdAndUpdate(
    sessionId,
    { status: "closed", endedAt: new Date() },
    { new: true }
  );
}


const all = {
  createSession,
  getSessionById,
  getAllSessions
}

export default all