export const message_context = async (messages) => {
    const context_messages = []
    for (let data of messages) {
        if (Boolean(data.message)) {
            if (context_messages.length < 15) {
                context_messages.unshift({ role: data.sender_type == "customer" ? "user" : "assistant", content: data.message })
            }
        }
    }
    return context_messages
}

