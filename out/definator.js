window.$ = window.jQuery = require("jquery");
const database = {
    "中文": "the Chinese language",
    "很": "very, is (with adjectives",
    "好": "good, nice",
    "这": "this",
    "是": "to be",
    "一": "one",
    "句": "classifier for sentences, phrases",
    "话": "speech"
}
const {createPopper} = require("@popperjs/core")
$("#definition").hide();
$(document).ready(function() {
    var words = $(".word");
    for (let word of words) {
        createPopper(word, $("#definition")[0]);
        word.addEventListener("mouseenter", function() {
            $("#definition").html(database[word.textContent]);
            $("#definition").show();
        });
        word.addEventListener("mouseleave", function() {
            $("#definition").hide();
        });
    }
});