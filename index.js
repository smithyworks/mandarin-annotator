'use strict';

let $ = require("jquery");
require("bootstrap");
let Dictionary = require("./dictionary");
const fs = require('fs');

let dictFileNames = fs.readdirSync("./data/");

//add all built-in datasets as options
for (let dictFileName of dictFileNames) {
    $('#selectBuiltIn').append('<option>' + dictFileName + '</option');
}

//reset the file chooser if the user selects a built-in dataset
$('#selectBuiltIn').click(function(event) {
    $('#fileChooser').prop("value", "");
});

//reset the selector if the user chooses a custom dataset
$('#fileChooser').change(function(event) {
    $('#selectBuiltIn').prop("selectedIndex", 0);
});

//add the dataset to the window's database
$('#loadDict').click(function(event) {
    //initialize the dictionary database system (TM)
    if ($('#selectBuiltIn').prop('selectedIndex') != 0) {
        window.database.addData('./data/' + $('#selectBuiltIn').prop('value'));
    } else {
        window.database.addDatas($('#fileChooser').prop('files'));
    }
});

window.database = new Dictionary();
window.addEventListener('close', (event) => {
    database.close();
});