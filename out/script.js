window.$ = window.jQuery = require("jquery");

require("bootstrap");

$(function () {$('[data-toggle="tooltip"]').tooltip()});
$(function () {$('[data-toggle="popover"]').popover()});

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

$(function () {$('[data-toggle="popover"]').hover(
  function(event) {
    let word = database[event.target.textContent];
    $(event.target).attr(
      "data-content",
      "<h5>" + word.characters + "</h5>" + 
      "<h6>" + word.pinyin + "</h6>" +
      "<ul>" +
      (function(defs) {
        let list = "";
        for (let def of defs) {
          list += "<li>";
          list += def;
          list += "</li>";
        }
        return list;
      })(word.definitions) +
      "</ul>"
    );
    $(event.target).popover('update');
  });
});

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
