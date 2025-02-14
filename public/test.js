function truncateArrayTo500(arr) {
    let joinedString = arr.join("_n_"); // Join with _n_
    if (joinedString.length <= 500) return joinedString.split("_n_"); // Return as an array if within limit
    console.log({ len: joinedString.length })

    let truncatedString = joinedString.slice(0, 500); // Cut at 500 characters

    let lastSeparator = truncatedString.lastIndexOf("_n_");
    if (lastSeparator > 0) {
        truncatedString = truncatedString.slice(0, lastSeparator); // Trim to last full section
    }
    return truncatedString.split("_n_"); 
}


const resultArray = truncateArrayTo500(largeArray);
console.log(resultArray);
