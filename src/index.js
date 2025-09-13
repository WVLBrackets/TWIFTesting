// src/index.js

const fs = require('fs-extra');
const csv = require('csv-parser');
const path = require('path');

console.log("TWIF project is running");

const csvFilePath = path.join(__dirname, '..', 'data', 'sample.csv');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
