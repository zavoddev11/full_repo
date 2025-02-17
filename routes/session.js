const router = require("express").Router();
const { getSessionById, createSession, getSessions } = require("./../controllers/session")

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSessionById);

module.exports = router;
