import { getMessagesBySession, createMessage } from "./../services/message.js"


export const getQuestionAndAnswerBySessionId = async (req, res, next) => {
    try {
        let id = await req.params.session_id
        console.log({ id })
        const messages = await getMessagesBySession(id)


        let messageMap = new Map();
        let questionAndAnswer = [];

        // First, create a map with reply_to as keys and their corresponding messages as values
        messages.forEach(message => {
            if (message.reply_to) {
                messageMap.set(message.reply_to.toString(), message);
            }
        });

        questionAndAnswer = messages
            .filter(data => !data.reply_to)
            .map(question => {
                const answer = messageMap.get(question._id.toString()); // Retrieve the answer from the map
                return {
                    question: question.message,
                    answer: answer ? answer.message : null,
                    question_id: question._id,
                    answer_id: answer ? answer._id : null,
                };
            });

        return res.status(200).json(questionAndAnswer);

    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}


export const getQuestionAndAnswer = async (req, res, next) => {
    try {
        let id = await req.params.id
        console.log({ id })
        const messages = await getMessagesBySession(id)


        let messageMap = new Map();
        let questionAndAnswer = [];

        // First, create a map with reply_to as keys and their corresponding messages as values
        messages.forEach(message => {
            if (message.reply_to) {
                messageMap.set(message.reply_to.toString(), message);
            }
        });

        questionAndAnswer = messages
            .filter(data => !data.reply_to)
            .map(question => {
                const answer = messageMap.get(question._id.toString()); // Retrieve the answer from the map
                return {
                    question: question.message,
                    answer: answer ? answer.message : null,
                    question_id: question._id,
                    answer_id: answer ? answer._id : null,
                };
            });

        return res.status(200).json(questionAndAnswer);

    } catch (error) {
        return res.status(500).json({ msg: "Failed to Fetch Messages to the database" });
    }
}