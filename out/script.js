$(function () {$('[data-toggle="tooltip"]').tooltip()})
$(function () {$('[data-toggle="popover"]').popover()})

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
    count += $('.hsk∞').length;
  }

  $('#vocab-count').html(count);
}

countVocab();

$('#toggle-1').click(function() {
  if (hsk1 == true) {
    $('#toggle-1').addClass('disabled');
    $('#toggle-1 .fa').removeClass('fa-check');
    $('#toggle-1 .fa').addClass('fa-times');
    $('.item.hsk1').addClass('hide');
    hsk1 = false;
  } else {
    $('#toggle-1').removeClass('disabled');
    $('#toggle-1 .fa').removeClass('fa-times');
    $('#toggle-1 .fa').addClass('fa-check');
    $('.item.hsk1').removeClass('hide');
    hsk1 = true;
  }
  countVocab();
})

$('#toggle-2').click(function() {
  if (hsk2 == true) {
    $('#toggle-2').addClass('disabled');
    $('#toggle-2 .fa').removeClass('fa-check');
    $('#toggle-2 .fa').addClass('fa-times');
    $('.item.hsk2').addClass('hide');
    hsk2 = false;
  } else {
    $('#toggle-2').removeClass('disabled');
    $('#toggle-2 .fa').removeClass('fa-times');
    $('#toggle-2 .fa').addClass('fa-check');
    $('.item.hsk2').removeClass('hide');
    hsk2 = true;
  }
  countVocab();
})

$('#toggle-3').click(function() {
  if (hsk3 == true) {
    $('#toggle-3').addClass('disabled');
    $('#toggle-3 .fa').removeClass('fa-check');
    $('#toggle-3 .fa').addClass('fa-times');
    $('.item.hsk3').addClass('hide');
    hsk3 = false;
  } else {
    $('#toggle-3').removeClass('disabled');
    $('#toggle-3 .fa').removeClass('fa-times');
    $('#toggle-3 .fa').addClass('fa-check');
    $('.item.hsk3').removeClass('hide');
    hsk3 = true;
  }
  countVocab();
})

$('#toggle-4').click(function() {
  if (hsk4 == true) {
    $('#toggle-4').addClass('disabled');
    $('#toggle-4 .fa').removeClass('fa-check');
    $('#toggle-4 .fa').addClass('fa-times');
    $('.item.hsk4').addClass('hide');
    hsk4 = false;
  } else {
    $('#toggle-4').removeClass('disabled');
    $('#toggle-4 .fa').removeClass('fa-times');
    $('#toggle-4 .fa').addClass('fa-check');
    $('.item.hsk4').removeClass('hide');
    hsk4 = true;
  }
  countVocab();
})

$('#toggle-5').click(function() {
  if (hsk5 == true) {
    $('#toggle-5').addClass('disabled');
    $('#toggle-5 .fa').removeClass('fa-check');
    $('#toggle-5 .fa').addClass('fa-times');
    $('.item.hsk5').addClass('hide');
    hsk5 = false;
  } else {
    $('#toggle-5').removeClass('disabled');
    $('#toggle-5 .fa').removeClass('fa-times');
    $('#toggle-5 .fa').addClass('fa-check');
    $('.item.hsk5').removeClass('hide');
    hsk5 = true;
  }
  countVocab();
})

$('#toggle-6').click(function() {
  if (hsk6 == true) {
    $('#toggle-6').addClass('disabled');
    $('#toggle-6 .fa').removeClass('fa-check');
    $('#toggle-6 .fa').addClass('fa-times');
    $('.item.hsk6').addClass('hide');
    hsk6 = false;
  } else {
    $('#toggle-6').removeClass('disabled');
    $('#toggle-6 .fa').removeClass('fa-times');
    $('#toggle-6 .fa').addClass('fa-check');
    $('.item.hsk6').removeClass('hide');
    hsk6 = true;
  }
  countVocab();
})

$('#toggle-0').click(function() {
  if (hsk0 == true) {
    $('#toggle-0').addClass('disabled');
    $('#toggle-0 .fa').removeClass('fa-check');
    $('#toggle-0 .fa').addClass('fa-times');
    $('.item.hsk∞').addClass('hide');
    hsk0 = false;
  } else {
    $('#toggle-0').removeClass('disabled');
    $('#toggle-0 .fa').removeClass('fa-times');
    $('#toggle-0 .fa').addClass('fa-check');
    $('.item.hsk∞').removeClass('hide');
    hsk0 = true;
  }
  countVocab();
})
