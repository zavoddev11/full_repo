import { socketClient } from "../index.js";
import { getAllWebsites, createWebsite, getWebsiteById } from "./../services/website.js";


export const getAllTheWebsites = async (req, res, next) => {
    try {
        let id = await req.params.id
        console.log({ id })
        const websites = await getAllWebsites()
        return res.status(200).json(websites);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Failed to Fetch Websites to the database" });
    }
}


export const getWebsitesById = async (req, res, next) => {
    try {
        let id = await req.params.id
        const websites = await getWebsiteById(id)
        return res.status(200).json(websites);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Websites to the database" });
    }
}

export const updateWebsitesById = async (req, res, next) => {
    try {
        let id = await req.params.id
        const websites = await getWebsiteById(id)
        socketClient.emit("create:website", req.body)
        return res.status(200).json(websites);
    } catch (error) {
        console.log({error})
        return res.status(500).json({ msg: "Failed to Fetch Websites to the database" });
    }
}


export const createAWebsite = async (req, res, next) => {
    try {
        let websiteData = req.body
        const website = await createWebsite(websiteData)
        console.log({ website })
        socket.emit("create:website", websiteData)
        return res.status(201).json(website);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Add Website to the database" });
    }
}


