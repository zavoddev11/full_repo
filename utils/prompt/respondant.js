module.exports.respondant_query = (refinedData, siteData, question) => {

let data = `

Here is the company summary: 
${refinedData}


Here is the array:
${siteData}

customer question: ${question}


"Act as a customer support AI using the provided company summary.
 Answer questions concisely (max 21 words). If details are missing,
 direct users to the most relevant link from the provided list."

`
    console.log(data)
    return data
}