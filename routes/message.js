
import { Router } from "express";
const router = Router()

import { getSessionMessages, createAMessage, getAllTheMessages } from "./../controllers/message.js"

router.get("/", getAllTheMessages);
router.post("/", createAMessage);
router.get("/session/:id", getSessionMessages);

export default router;
