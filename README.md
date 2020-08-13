# Mandarin Annotator

This program is designed to assist learners in the reading of Chinese-language texts. It accepts texts (that have already been segmented), displays them, and, when a user mouses over a word, it will display a pop-up of the word's definition(s). Moreover, it allows the user to edit dictionary definitions and even adjust word boundaries.

# Usage

Overall, the program is very simple. Pick the input file with the file chooser and click "Load Text". The text will appear below the program controls. Mouse over any word for a definition

## Edit Mode

To change the definition or boundaries of a word, go into edit mode by clicking on the word.

In edit mode, the popover will no longer disappear without hovering over the word. Definitions and pinyin listings will be editable text boxes

Note: Currently, words that are not defined cannot be edited. This will be fixed.

The 'save' button will save your definitions to the database. (Note: Currently, the in-text editor will save custom definitions to the 'persistent' level of the database. This means that the changes will persist after the current text is closed. It also means that changes made in edit mode will NOT override definitions embedded in the input file. This will be fixed.)

The 'cancel' button will reset the edit popover.

The two arrow buttons will expand the word, consuming neighboring characters.

The two circle buttons will break off characters at either end into new spans.

## Input Files

Each paragraph should be separated by a newline character. Every word should be separated by a space. Punctuation should not be included in words.

Note: Currently only texts written with simplified characters are supported. This will be fixed.

In addition to text, input files can include a JSON object that specifies information about the text. Currently, the only supported feature is the ability to define words in the text. This can be useful for names or esoteric terms.

The data should be a valid JSON object placed before the text. See "test.seg" for an example.

### Segmentation

Segmentation is not currently a feature of this program. However, a number of 3rd party segmenters exist, such as cpsmith27's simple segment.rb, to Stanford NLP's segmenter.

## Vocabulary Editor

There are 3 levels to the dictionary. The core dictionary (0) is based on the crowdsourced CC-CEDICT project, and provides default definitions fr more than 115,000 words. It cannot be edited. The local custom dictionary (1) is saved with the core dictionary, but can be edited and added to by the user. The text dictionary (2) consists of definitions that may only be applicable to a single text. These can be saved within text files, where they will be loaded automatically.

Higher levels override lower levels. If a word is defined in the default dictionary but there is an entry for it in the local custom dictionary, only the latter will appear in popups. Text definitions override custom definitions.

The Vocabulary Editor allows you to edit the custom dictionary. It's operation is fairly straightforward and similar to the in-text editor, but it allows the user to manually add entries.

# Roadmap

* There is a bug where some popovers do not display
* There is a bug where some popovers are too big, obscuring the word such that they cannot be closed

# Libraries used

This project uses:

- [bootstrap](http://getbootstrap.com/).
- [Font Awesome](http://fontawesome.io/).
- [The CC-CEDICT Chinese-English dictionary](https://www.mdbg.net/chinese/dictionary?page=cedict).

# License

Copyright 2017 Christopher Smith (silversmith02@gmail.com), All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
