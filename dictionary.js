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
                'simpChars=? ORDER BY custom DESC;'
            );
            this.#selEntriesTradHead = this.db.prepare(
                'SELECT * FROM entries WHERE ' +
                'tradChars=? ORDER BY custom DESC;'
            );
            this.#selDefinitions = this.db.prepare(
                'SELECT * FROM definitions WHERE dicid=? ;'
            );
        } catch (err) {
            this.db.close();
            console.error(err.message)
        }
    }

    applyLayerModel(entries) {
        let filteredEntries = [...entries];
        for (let entry of entries) {
            filteredEntries = filteredEntries.filter(tstEntry => {
                if (
                    tstEntry.simpChars != entry.simpChars ||
                    tstEntry.tradChars != entry.tradChars ||
                    tstEntry.pinyin    != entry.pinyin
                ) {
                    //if the entries do not match, they are not
                    //unique, and layering does not apply
                    return true;
                }

                //if they are unique, eliminate the entry in the
                //lower layer
                if (tstEntry.custom < entry.custom) {
                    return false;
                }

                return true;
            });
        }
        return filteredEntries;
    }

    //return an array of definition objects
    getDefinitions(headword, isSimplified) {
        let entries;
        if (isSimplified) {
            entries = this.#selEntriesSimpHead.all(headword);
        } else {
            entries = this.#selEntriesTradHead.all(headword);
        }

        entries = this.applyLayerModel(entries);

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