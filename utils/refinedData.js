export const query = (siteData, question) => `This is a website data in json here
${siteData}


Act as a respondant of this website and answer the question precisely in not more than 20 words.
PROMPT: ${question}
`