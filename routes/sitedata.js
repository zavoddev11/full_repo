import { Router } from "express"
import { getAllTheSiteDatas, getSiteDatasById } from "./../controllers/sitedata.js"
// const { generatePageDetails } = require("./../controllers/data")
const router = Router()

// createStorage()
// router.post("/data", generatePageDetails);
router.get("/", getAllTheSiteDatas);
router.get("/:id", getSiteDatasById);

export default router;
