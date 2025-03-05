import Sitedata from "../../models/sitedata.js";
import { chatWithGPT } from "../ai_bot.js";
import { respondant_query } from "./respondant.js";
import { SummarizerManager } from 'node-summarizer';




export const testAi = async (website_id) => {
    try {
        let sitedata = await Sitedata.find({ website_id })
        let strigify_sitedata = JSON.stringify(sitedata)
        // console.log(strigify_sitedata)
        const numberOfSentences = 4000; // Adjust as needed

        const summarizer = new SummarizerManager(strigify_sitedata, numberOfSentences);
        const summary = summarizer.getSummaryByFrequency().summary;


        console.log(summary);

        // let ai_query = respondant_query(
        //     strigify_sitedata,
        //     "Hello"
        // );

        // console.log({ ai_query })
        // let ai_response = await chatWithGPT("session_id", ai_query);
        // console.log({ ai_response })
    } catch (error) {
        console.log({ ai_error: error })
    }
}