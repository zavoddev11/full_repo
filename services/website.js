import Website from "../models/website.js";

export const createWebsite = async function createMessage(data) {
    try {
        console.log({ data })

        let website = await Website.create({
            name: data.name,
            websiteLink: data.websiteLink,
            status: "active"
        })

        return website
    } catch (error) {
        console.log(error)
    }
}

export const getWebsiteById = async function getWebsiteById(id) {
    return await Website.findById(id)
}

export const getAllWebsites = async function getAllWebsite() {
    return await Website.find()
}
