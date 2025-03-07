import Sitedata from "./../models/sitedata.js";

export const getSitedataByWebsiteId = async function SitedataByWebsite(id) {
    return await Sitedata.find({ website_id: id })
}

export const getAllSitedata = async function getAllWebsite() {
    return await Sitedata.find()
}