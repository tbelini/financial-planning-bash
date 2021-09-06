const fs = require('fs').promises;
const moment = require("moment-timezone");

//const fs = require('fs');

/*
fs.appendFile('../files/mynewfile1.txt', 'Hello content!', function (err) {
  if (err) throw err;
  console.log('Saved!');
});

fs.writeFile(, jsonFile, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
*/

const dateNow = moment().tz("America/Sao_Paulo").format("YYYYMMDDTHHmmss");
const filePath = '../files/';
const fileName = `mynewfile_${dateNow}.json`;
const jsonFile = '{"a": 12}';

//console.log('Data atual:', dateNow);

const writeFile = async function() {
    try {
        await fs.writeFile(filePath.concat(fileName), jsonFile);
    } catch (error) {
        console.error(`Got an error trying to write to a file: ${error.message}`);
    }
}

writeFile();