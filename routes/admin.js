
import { Router } from "express";
import { getQuestionAndAnswerBySessionId } from "./../controllers/admin.js"

const router = Router()

router.get("/qna/:session_id", getQuestionAndAnswerBySessionId);
router.get("/qna", getQuestionAndAnswerBySessionId);

export default router