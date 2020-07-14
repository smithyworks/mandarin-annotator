const { data } = require("jquery");

window.$ = window.jQuery = require("jquery");

require("bootstrap");

$(function () {$('[data-toggle="tooltip"]').tooltip()});

//a placeholder for the actual definition database
const database = {
  "中文": {characters: "中文", pinyin: "zhongwen", definitions: ["the Chinese language"]},
  "很": {characters: "很", pinyin: "hen", definitions: ["very", "is (with adjectives)"]},
  "好": {characters: "好", pinyin: "hao", definitions: ["good", "nice"]},
  "这": {characters: "这", pinyin: "zhe", definitions: ["this"]},
  "是": {characters: "是", pinyin: "shi", definitions: ["to be"]},
  "一": {characters: "一", pinyin: "yi", definitions: ["one"]},
  "句": {characters: "句", pinyin: "ju", definitions: ["classifier for sentences and phrases"]},
  "话": {characters: "话", pinyin: "hua", definitions: ["speech"]}
}

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

  this.getDefinition = function() {
    let popContent = "";
    let word = database[element.textContent];
    if (word != undefined) {
      popContent += "<h5>" + word.characters + "</h5>";
      popContent += "<h6>" + word.pinyin + "</h6>";
      popContent += "<ul>";
      for (let def of word.definitions) {
        popContent += "<li>";
        popContent += def;
        popContent += "</li>";
      }
      popContent += "</ul>";
    } else {
      popContent += "<h5>Unknown|非知</h5>";
      popContent += "<h6>There is no entry in the<br/>dictionary for this string</h6>";
    }
    return popContent;
  }

  this._createEditPopover = function() {
    //whitelist button elements for the sanitizer (it's a Bootstrap thing)
    let nWhiteList = $.fn.tooltip.Constructor.Default.whiteList;
    nWhiteList.button = [];

    $(this.element).popover('dispose');

    //create regular popover, but with buttons
    $(this.element).popover({
      content: this.getDefinition() + '<div><button type="button" id="breakLeft" class="btn">o</button><button type="button" id="expandLeft" class="btn">&lt;</button><button id="expandRight" type="button" class="btn">&gt;</button><button type="button" id="breakRight" class="btn">o</button></div>',
      delay: 0,
      html: true,
      placement: "bottom",
      trigger: "manual",
      whiteList: nWhiteList
    });
    $(this.element).popover('show');

    //add the appropriate listeners to the buttons
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
    $(this.element).css("background-color", "lightgray");
    $(this.element).popover({
      content: this.getDefinition(),
      delay: 300,
      html: true,
      placement: "bottom",
      trigger: "manual"
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
