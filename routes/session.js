import { Router } from "express"
import { getSessionById, createSession, getSessions } from "./../controllers/session.js"
// const { generatePageDetails } = require("./../controllers/data")
const router = Router()

// createStorage()
// router.post("/data", generatePageDetails);
router.get("/", getSessions);
router.post("/", createSession);
router.get("/:id", getSessionById);

export default router;
