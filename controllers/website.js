import { getAllWebsites, createWebsite, getWebsiteById } from "./../services/website.js";
import socket from "socket.io-client"
import { config } from "dotenv";
config()


const SOCKET_URL = process.env.SOCKET_URL

console.log({ SOCKET_URL })


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
        let body = await req.body
        const websites = await getWebsiteById(id)
        
        let timeoutId = setTimeout(() => {
            const socketClient = socket.connect(SOCKET_URL);
            socketClient.emit("create:website", "websiteData", () => {
                socketClient.disconnect();
                socketClient = null;
            })

        }, 10000); // 10 seconds

        // Clear the timeout before it executes
        setTimeout(() => {
            clearTimeout(timeoutId);
            console.log("Timeout cleared before execution.");
        }, 5000);

        return res.status(200).json(websites);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ msg: "Failed to Fetch Websites to the database" });
    }
}


export const createAWebsite = async (req, res, next) => {
    try {
        let websiteData = req.body
        const website = await createWebsite(websiteData)
        console.log({ website })

        let timeoutId = setTimeout(() => {
            const socketClient = socket.connect(SOCKET_URL);
            socketClient.emit("create:website", "websiteData", () => {
                socketClient.disconnect();
                socketClient = null;
            })

        }, 10000); // 10 seconds

        // Clear the timeout before it executes
        setTimeout(() => {
            clearTimeout(timeoutId);
            console.log("Timeout cleared before execution.");
        }, 5000);

        return res.status(201).json(website);
    } catch (error) {
        return res.status(500).json({ msg: "Failed to Add Website to the database" });
    }
}


