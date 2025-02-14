
const router = require("express").Router();
const { getSessionById, createSession } = require("./../controllers/session")

router.post("/", createSession);
router.get("/:id", getSessionById);

module.exports = router;
