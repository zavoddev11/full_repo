
export function getSessionId() {
    try {


        let storedSessionId = localStorage.getItem("session_id");
        if (!storedSessionId) {
            let extractedData = extractData()
            console.log({ extractedData })
            storedSessionId = nanoid();
            localStorage.setItem("session_id", storedSessionId);
        }
        return storedSessionId;

    } catch (error) {
        console.log({ error })
    }
}