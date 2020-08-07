const { data } = require("jquery");

window.$ = window.jQuery = require("jquery");

require("bootstrap");

var converter = require('pinyin-tone-converter');

let Dictionary = require("../dictionary");

$(function () {$('[data-toggle="tooltip"]').tooltip()});

//a placeholder for the actual definition database
const tmpDatabase = {
  "中文": {characters: "中文", pinyin: "zhong1wen2", definitions: ["the Chinese language"]},
  "很": {characters: "很", pinyin: "hen3", definitions: ["very", "is (with adjectives)"]},
  "好": {characters: "好", pinyin: "hao3", definitions: ["good", "nice"]},
  "这": {characters: "这", pinyin: "zhe4", definitions: ["this"]},
  "是": {characters: "是", pinyin: "shi4", definitions: ["to be"]},
  "一": {characters: "一", pinyin: "yi1", definitions: ["one"]},
  "句": {characters: "句", pinyin: "ju4", definitions: ["classifier for sentences and phrases"]},
  "话": {characters: "话", pinyin: "hua4", definitions: ["speech"]}
}

//load the actual database
var database = new Dictionary();

//whitelist button elements for the sanitizer (it's a Bootstrap thing)
let nWhiteList = $.fn.tooltip.Constructor.Default.whiteList;
nWhiteList.button = ["type"];
nWhiteList.input = ["value", "type"];

//a global variable indicating whether or not any popover anywhere in the document is in edit mode
var anyEditMode = false;

/*
  This object allows word spans to control the contents of their own popover elements.
  It also allows them to change their own boundaries
*/
function spanMachine(element) {
  "use strict";

  this.element = element;

  this.editMode = false;

  this.getDefinition = function(tagSet, prettyPinyin) {
    let popContent = "";
    let words = database.getDefinitions(element.textContent, true);
    if (words.length > 0) {
      for (const word of words) {
        popContent += "<h5>" + word.tradChars + '|' + word.simpChars + "</h5>";
        popContent += tagSet.pinyin[0] + ((prettyPinyin) ? converter.convertPinyinTones(word.pinyin) : word.pinyin) + tagSet.pinyin[1];
        popContent += "<ul>";
        for (let def of word.definitions) {
          popContent += tagSet.definition[0] + def + tagSet.definition[1];
        }
        popContent += "</ul>";        
      }
    } else {
      //TODO: create edit mode of this popover
      popContent += "<h5>" + this.element.innerHTML + "</h5>";
      popContent += "<h6>There is no entry in the<br/>dictionary for this string</h6>";
    }
    if (tagSet.editTags != undefined) {
      popContent += tagSet.editTags;
    }
    return popContent;
  }

  this._createEditPopover = function() {
    $(this.element).popover('dispose');

    let cancelSave = '<div><button type="button" id="cancel" class="btn">Cancel</button><button type="button" id="save" class="btn">Save</button></div>';
    let addDef = '<div><button type="button" id="addDef" class="btn">Add Definition</button></div>'
    let expanders = '<div><button type="button" id="breakLeft" class="btn">o</button><button type="button" id="expandLeft" class="btn">&lt;</button><button id="expandRight" type="button" class="btn">&gt;</button><button type="button" id="breakRight" class="btn">o</button></div>'
    let tagSet = {
      pinyin: ['<input id="pinyin" type="text" value="', '"/>'],
      definition: ['<input class="defInput" type="text" value="', '"/><button type="button" class="btn removeDef">-</button>'],
      editTags: addDef + cancelSave + expanders
    };

    //create regular popover, but with buttons
    $(this.element).popover({
      content: this.getDefinition(tagSet, false),
      delay: 0,
      html: true,
      placement: "bottom",
      trigger: "manual",
      whiteList: nWhiteList
    });
    $(this.element).popover('show');

    //add the appropriate listeners to the buttons
    $(".removeDef").prop("parentSpan", this.element);
    $(".removeDef").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.removeDef($(event.target).prev().prop("value"));
    });
    $("#addDef").prop("parentSpan", this.element);
    $("#addDef").click(function(event) {
      //      button                                                 button     div      ul
      $(event.target).prop("parentSpan").spanComputer.addDef($(event.target.parentNode).prev());
    });
    $("#cancel")[0].parentSpan = this.element;
    $("#cancel").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.cancel();
    });
    $("#save")[0].parentSpan = this.element;
    $("#save").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.save();
    });
    $("#breakLeft")[0].parentSpan = this.element; //add needed reference to the span this button controls
    $("#breakLeft").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.breakLeft();
    });
    $("#expandLeft")[0].parentSpan = this.element; //add needed reference to the span this button controls
    $("#expandLeft").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.expandLeft();
    });
    $("#expandRight")[0].parentSpan = this.element;
    $("#expandRight").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.expandRight();
    });
    $("#breakRight")[0].parentSpan = this.element;
    $("#breakRight").click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.breakRight();
    });
  }

  this.removeDef = function(definition) {
    //just remove the definition (if any) from the database and redraw the popover
    tmpDatabase[this.element.innerHTML].definitions =
      tmpDatabase[this.element.innerHTML].definitions.filter(function (value, index, arr) {
        return value !== definition;
      })
    ;
    console.log(definition);
    this._createEditPopover();
  }

  this.addDef = function(ul) {
    //create dom elements, configure them, and add to the dom
    let newLI = document.createElement("li");

    let newInput = document.createElement("input");
    $(newInput).addClass("defInput")
    newInput.type = "text";

    let newButton = document.createElement('button');
    newButton.type = "button";
    $(newButton).addClass("btn removeDef");
    newButton.innerHTML = "-";
    $(newButton).prop("parentSpan", this.element);
    $(newButton).click(function(event) {
      $(event.target)[0].parentSpan.spanComputer.removeDef($(event.target).prev().prop("value"));
    });

    newLI.appendChild(newInput);
    newLI.appendChild(newButton);

    ul.append(newLI);
  }

  this.cancel = function() {
    //just redraw the popover. it will revert to whatever has been already saved to the database
    this._createEditPopover();
  }

  this.save = function() {
    let defs = []; //first gather all the definitions
    $(".defInput").each(function(index, element) {
      if (element.value !== "") {
        defs.push(element.value);
      }
    });
    tmpDatabase[this.element.innerHTML] = { //replace entry based in current textbox information
      characters: this.element.innerHTML,
      pinyin: $("#pinyin").prop("value"),
      definitions: defs
    };
    this._createEditPopover();
  }

  this.breakLeft = function() {
    if (this.element.innerHTML.length > 1) {
      $(this.element).before('<span class="simplified" data-toggle="popover">' + this.element.innerHTML.charAt(0) + '</span>');
      $(this.element).prev().each( function(index, element) {
        element.spanComputer = new spanMachine(element);
      });
      $(this.element).prev().mouseenter(function(event) {
        event.target.spanComputer.popup();
      });
      $(this.element).prev().click(function(event) {
        event.target.spanComputer.toggleEditMode();
      });
      $(this.element).prev().mouseleave(function(event) {
        event.target.spanComputer.popdown();
      })

      this.element.innerHTML = this.element.innerHTML.substr(1);
      this._createEditPopover();
    }
  }

  this.breakRight = function() {
    if (this.element.innerHTML.length > 1) {
      let len = this.element.innerHTML.length;

      $(this.element).after('<span class="simplified" data-toggle="popover">' + this.element.innerHTML.charAt(len-1) + '</span>');
      $(this.element).next().each( function(index, element) {
        element.spanComputer = new spanMachine(element);
      });
      $(this.element).next().mouseenter(function(event) {
        event.target.spanComputer.popup();
      });
      $(this.element).next().click(function(event) {
        event.target.spanComputer.toggleEditMode();
      });
      $(this.element).next().mouseleave(function(event) {
        event.target.spanComputer.popdown();
      })

      this.element.innerHTML = this.element.innerHTML.substr(0,len-1);
      this._createEditPopover();
    }
  }

  this.expandLeft  = function()  {
    let expandTo = $(this.element).prev()[0]; //TODO: handle case of no earlier element
    let expansionChars = expandTo.innerHTML;
    if (expansionChars.length <= 1) {
      //if there was only one character, remove the empty element
      this.element.parentNode.removeChild(expandTo);
    } else {
      //strip the last character out of previous node
      expandTo.innerHTML = expansionChars.substr(0,expansionChars.length-1);
    }
    
    //add to beginning of this span
    this.element.innerHTML = expansionChars.charAt(expansionChars.length-1) + this.element.innerHTML;
    this._createEditPopover();
  }

  this.expandRight = function() {
    let expandTo = $(this.element).next()[0]; //TODO: handle case of no later element
    let expansionChars = expandTo.innerHTML;
    if (expansionChars.length <= 1) {
      //if there was only one character, remove the empty element
      this.element.parentNode.removeChild(expandTo);
    } else {
      //strip the first character out of next node
      expandTo.innerHTML = expansionChars.substr(1);
    }
    
    //add to beginning of this span
    this.element.innerHTML = this.element.innerHTML + expansionChars.charAt(0);
    this._createEditPopover();
  }

  this.toggleEditMode = function() {
    if (!this.editMode && !anyEditMode) { //if not in edit mode, and no one else in edit mode
      this._createEditPopover();

      anyEditMode = true;
      this.editMode = true;
    } else if (this.editMode) { //else in edit mode
      $(this.element).popover('dispose');
      //regular word popup
      this.popup();
      this.editMode = false;
      anyEditMode = false;
    }
  }

  this.popup = function() {
    let tagSet = {
      pinyin: ['<h6>', '</h6>'],
      definition: ['<li>', '</li>']
    };
    $(this.element).css("background-color", "lightgray");
    $(this.element).popover({
      content: this.getDefinition(tagSet, true),
      delay: 300,
      html: true,
      placement: "bottom",
      trigger: "manual",
      whiteList: nWhiteList
    });
    $(this.element).popover('show');
  }

  this.popdown = function() {
    if (!this.editMode) {
      $(this.element).popover('dispose');
      $(this.element).css("background-color", "");
    }
  }
  return this;
}

//add a spanComputer to each element
$(function () {
  $('[data-toggle="popover"]').each( function(index, element) {
    element.spanComputer = new spanMachine(element);
  });
});

//add appropriate listeners to control spanComputer events
$(function () {$('[data-toggle="popover"]').mouseenter(
  function(event) {
    event.target.spanComputer.popup();
  });
});
$(function () {$('[data-toggle="popover"').click(
    function(event) {
      event.target.spanComputer.toggleEditMode();
  });
});
$(function(){$('[data-toggle="popover').mouseleave(
  function(event) {
    event.target.spanComputer.popdown();
  }
)})

hsk1 = true;
hsk2 = true;
hsk3 = true;
hsk4 = true;
hsk5 = true;
hsk6 = true;
hsk0 = true;

function countVocab() {
  count = 0;
  if (hsk1 == true) {
    count += $('.hsk1').length;
  }
  if (hsk2 == true) {
    count += $('.hsk2').length;
  }
  if (hsk3 == true) {
    count += $('.hsk3').length;
  }
  if (hsk4 == true) {
    count += $('.hsk4').length;
  }
  if (hsk5 == true) {
    count += $('.hsk5').length;
  }
  if (hsk6 == true) {
    count += $('.hsk6').length;
  }
  if (hsk0 == true) {
    count += $('.hsk0').length;
  }

  $('#vocab-count').html(count);
}

countVocab();

function hideHSKLevel(level) {
  $('#toggle-' + level).addClass('disabled');
  $('#toggle-' + level + ' .fa').removeClass('fa-check');
  $('#toggle-' + level + ' .fa').addClass('fa-times');
  $('.item.hsk' + level).addClass('hide');
}

function showHSKLevel(level) {
  $('#toggle-' + level).removeClass('disabled');
  $('#toggle-' + level + ' .fa').removeClass('fa-times');
  $('#toggle-' + level + ' .fa').addClass('fa-check');
  $('.item.hsk' + level).removeClass('hide');
}

$('#toggle-1').click(function() {
  if (hsk1 == true) {
    hideHSKLevel(1);
    hsk1 = false;
  } else {
    showHSKLevel(1);
    hsk1 = true;
  }
  countVocab();
});

$('#toggle-2').click(function() {
  if (hsk2 == true) {
    hideHSKLevel(2);
    hsk2 = false;
  } else {
    showHSKLevel(2);
    hsk2 = true;
  }
  countVocab();
});

$('#toggle-3').click(function() {
  if (hsk3 == true) {
    hideHSKLevel(3);
    hsk3 = false;
  } else {
    showHSKLevel(3);
    hsk3 = true;
  }
  countVocab();
});

$('#toggle-4').click(function() {
  if (hsk4 == true) {
    hideHSKLevel(4);
    hsk4 = false;
  } else {
    showHSKLevel(4);
    hsk4 = true;
  }
  countVocab();
});

$('#toggle-5').click(function() {
  if (hsk5 == true) {
    hideHSKLevel(5);
    hsk5 = false;
  } else {
    showHSKLevel(5);
    hsk5 = true;
  }
  countVocab();
});

$('#toggle-6').click(function() {
  if (hsk6 == true) {
    hideHSKLevel(6);
    hsk6 = false;
  } else {
    showHSKLevel(6);
    hsk6 = true;
  }
  countVocab();
});

$('#toggle-0').click(function() {
  if (hsk0 == true) {
    hideHSKLevel(0);
    hsk0 = false;
  } else {
    showHSKLevel(0);
    hsk0 = true;
  }
  countVocab();
});

show_chars = true;
$('#toggle-chars').click(function() {
  if (show_chars == true) {
    $('.vocab .word').addClass('hide');
    $('.vocab .trad').addClass('hide');
    $('#toggle-chars').addClass('disabled');
    $('#toggle-chars .fa').removeClass('fa-check');
    $('#toggle-chars .fa').addClass('fa-times');
    $('.item .han').addClass('hide');
    $('.item .fa-square-o').removeClass('hide');
    show_chars = false;
  } else {
    $('.vocab .word').removeClass('hide');
    $('.vocab .trad').removeClass('hide');
    $('#toggle-chars').removeClass('disabled');
    $('#toggle-chars .fa').removeClass('fa-times');
    $('#toggle-chars .fa').addClass('fa-check');
    $('.item .han').removeClass('hide');
    $('.item .fa-square-o').addClass('hide');
    show_chars = true;
  }
});

show_pinyin = true;
$('#toggle-pinyin').click(function() {
  if (show_pinyin == true) {
    $('.vocab .pinyin').addClass('hide');
    $('#toggle-pinyin').addClass('disabled');
    $('#toggle-pinyin .fa').removeClass('fa-check');
    $('#toggle-pinyin .fa').addClass('fa-times');
    show_pinyin = false;
  } else {
    $('.vocab .pinyin').removeClass('hide');
    $('#toggle-pinyin').removeClass('disabled');
    $('#toggle-pinyin .fa').removeClass('fa-times');
    $('#toggle-pinyin .fa').addClass('fa-check');
    show_pinyin = true;
  }
});

show_defi = true;
$('#toggle-defi').click(function() {
  if (show_defi == true) {
    $('.vocab .defi').addClass('hide');
    $('#toggle-defi').addClass('disabled');
    $('#toggle-defi .fa').removeClass('fa-check');
    $('#toggle-defi .fa').addClass('fa-times');
    $('.vocab .entry').addClass('inline');
    show_defi = false;
  } else {
    $('.vocab .defi').removeClass('hide');
    $('#toggle-defi').removeClass('disabled');
    $('#toggle-defi .fa').removeClass('fa-times');
    $('#toggle-defi .fa').addClass('fa-check');
    $('.vocab .entry').removeClass('inline');
    show_defi = true;
  }
});
