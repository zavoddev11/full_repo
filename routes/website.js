import { Router } from "express"
import { getWebsitesById, getAllTheWebsites, createAWebsite, updateWebsitesById } from "./../controllers/website.js"
// const { generatePageDetails } = require("./../controllers/data")
const router = Router()

// createStorage()
// router.post("/data", generatePageDetails);
router.get("/", getAllTheWebsites);
router.post("/", createAWebsite);
router.patch("/:id", updateWebsitesById);
router.get("/:id", getWebsitesById);

export default router;
