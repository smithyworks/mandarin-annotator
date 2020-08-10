'use strict';

let $ = require("jquery");
let fs = require('fs');
let SpanMachine = require('./SpanMachine');

function loadFile(err, data) {
    //create div for whole text
    let docDiv = document.createElement('div');
    docDiv.id = 'chineseText';

    //add one line at a time
    //be sure to add the spanMachine to each word span
    let lines = data.split('\n');
    for (let line of lines) {
        line = line.trim().split(' ');
        if (line.length < 1) {
            continue;
        }

        let paragraph = document.createElement('p');
        if (line[0] === "#") {
            //make it a heading
            paragraph.classList.add('a');
            line.shift();
        }

        for (let word of line) {
            let element = document.createElement('span');

            //if it is a chinese character, it should be defined
            if (/\p{Script=Han}/u.test(word)) {
                element.classList.add('simplified');
                new SpanMachine(element);
            }
            element.innerHTML = word;

            paragraph.appendChild(element);
        }

        docDiv.appendChild(paragraph);
    }

    document.body.appendChild(docDiv);
}

$(function() {
    $('#loadDict').click(function(event) {
        if ($('#chineseText').length < 1) {
            fs.readFile($('#fileChooser').prop('files')[0].path, 'utf8', loadFile);
        }
    });
    $('#closeText').click(function(event) {
        $('#chineseText').remove();
    })
});