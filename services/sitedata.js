import Sitedata from "./../models/sitedata.js";

export const getSitedataByWebsiteId = async function Sitedata(id) {
    return await Sitedata.findById(id)
}

export const getAllSitedata = async function getAllWebsite() {
    return await Sitedata.find()
}