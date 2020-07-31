const fs = require('fs');
const Database = require('better-sqlite3');
const readline = require('readline');

module.exports = class Dictionary {
    #insEntries;            //insert an entry into the dictionary (needs simplified and traditional headword and pinyin)
    #insDefinitions;        //insert a definition that corresponds to an id of an entry
    #selIDEntriesFull;      //get the id of the entry that matches the traditional and simplified headword AND the pinyin
    #selEntriesSimpHead;    //get all entry records matching the simplified character headword
    #selEntriesTradHead;    //get all entry records matching the traditional character headword
    #selDefinitions;        //get all entry records matching the id of the entry they belong to
    #delDefinitions;        //delete all definitions that match the id of the entry they belong to

    constructor() {
        //create a SQLite database in memory
        this.db = new Database('./data/dictionary.db');
        try {
            // // create the dictionary table
            // this.db.prepare(
            //     'CREATE TABLE entries' +
            //     '(' +
            //     'id INTEGER PRIMARY KEY,' +
            //     'simpChars TEXT,' +
            //     'tradChars TEXT,' +
            //     'pinyin TEXT,' +
            //     'UNIQUE(simpChars,tradChars,pinyin)' +
            //     ');'
            // ).run();
            // //create the definitions table
            // this.db.prepare(
            //     'CREATE TABLE definitions' +
            //     '(' +
            //     'dicid INTEGER,' +
            //     'definition TEXT,' +
            //     'FOREIGN KEY(dicid) REFERENCES entries(id)' +
            //     ');'
            // ).run();
            console.log('Database initialized');

            this.#insEntries = this.db.prepare(
                "INSERT INTO entries (tradChars,simpChars,pinyin) " +
                "VALUES (?, ?, ?);"
            );
            this.#insDefinitions = this.db.prepare(
                "INSERT INTO definitions (dicid,definition) " +
                "VALUES (?, ?);"
            )
            this.#delDefinitions = this.db.prepare(
                "DELETE FROM definitions WHERE dicid=? ;"
            );
            this.#selIDEntriesFull = this.db.prepare(
                "SELECT id FROM entries WHERE " +
                "tradChars=? AND simpChars=? AND pinyin=?;"
            );
            this.#selEntriesSimpHead = this.db.prepare(
                'SELECT * FROM entries WHERE ' +
                'simpChars=? ;'
            );
            this.#selEntriesTradHead = this.db.prepare(
                'SELECT * FROM entries WHERE ' +
                'tradChars=? ;'
            );
            this.#selDefinitions = this.db.prepare(
                'SELECT * FROM definitions WHERE dicid=? ;'
            );
        } catch (err) {
            this.db.close();
            console.error(err.message)
        }
    }

    addData(file) {
        //read the file line by line
        let readInterface = readline.createInterface({
            input: fs.createReadStream(file),
            console: true
        });
        //insert each line into the database
        readInterface.on('line', (line) => {
            //this code was adapted from cpsmith's annotate.rb
            //it was translated from the original Ruby
            
            line = line.trim();

            if (line == '' || line[0] == '#') {
                return;
            }

            let tokens = line.split(' ');

            let tradChars = tokens[0];
            let simpChars = tokens[1];
            let pinyin = line.match(/(?<=\[)[^\/]*(?=\])/)[0];

            let definitions = line.match(/(?<=\/).*(?=\/)/)[0].split('/');

            try {
                this.#insEntries.run(tradChars, simpChars, pinyin);

                //get the id of the word we are about to define
                let dicid = this.#selIDEntriesFull.get(tradChars, simpChars, pinyin).id;
                //be sure to drop all existing definitions for the word first
                this.#delDefinitions.run(dicid);
                //INSERT all definitions of the word
                for (let definition of definitions) {
                    this.#insDefinitions.run(dicid,definition);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    addDatas(fileList) {
        for (let file of fileList) {
            this.addData(file.path);
        }
    }

    //return an array of definition objects
    getDefinitions(headword, isSimplified) {
        let entries;
        if (isSimplified) {
            entries = this.#selEntriesSimpHead.all(headword);
        } else {
            entries = this.#selEntriesTradHead.all(headword);
        }

        let self = this;

        //for each entry in the dictionary, return an object that holds all
        //of its headwords, its pronounciation, and all of its definitions
        entries = entries.map(function(entry) {
            let extractDefs = 
                self.#selDefinitions
                .all(entry.id)
                .map(defEntry => defEntry.definition)
            ;

            return {
                tradChars: entry.tradChars,
                simpChars: entry.simpChars,
                pinyin: entry.pinyin,
                definitions: extractDefs
            }
        });

        return entries;
    }

    close() {
        this.db.close();
    }
}