let $ = require("jquery");
require("bootstrap");
const fs = require('fs');

let dictFileNames = fs.readdirSync("./data/");

for (let dictFileName of dictFileNames) {
    $('#selectBuiltIn').append('<option>' + dictFileName + '</option');
}