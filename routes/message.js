
const router = require("express").Router();
const { getSessionMessages, createMessage } = require("./../controllers/message")

router.post("/", createMessage);
router.get("/session/:id", getSessionMessages);

module.exports = router;
