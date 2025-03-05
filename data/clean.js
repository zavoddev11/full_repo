import fs from 'fs'

// Function to remove duplicate lines
function removeDuplicateLines(filePath) {
  // Read the file content
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Split the content into lines
    const lines = data.split(/\r?\n/);

    // Create a Set to store unique lines
    const uniqueLines = new Set(lines);

    // Join the unique lines back into a single string
    const uniqueContent = Array.from(uniqueLines).join('\n');

    // Write the unique content back to the file
    fs.writeFile(filePath, uniqueContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to the file:', err);
      } else {
        console.log('Duplicate lines removed successfully.');
      }
    });
  });
}

// Specify the path to your note.txt file
const filePath = 'd.txt';

// Call the function to remove duplicate lines
removeDuplicateLines(filePath);
