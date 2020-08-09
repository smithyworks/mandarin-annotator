const fs = require('fs');
const Database = require('better-sqlite3');
const readline = require('readline');

const DictLevel = require("./databaseLevel");

module.exports = class Dictionary {
    #repEntries;            //insert an entry into the dictionary (needs simplified and traditional headword and pinyin)
    #insDefinitions;        //insert a definition that corresponds to an id of an entry
    #selEntriesFull;      //get the id of the entry that matches the traditional and simplified headword AND the pinyin
    #selEntriesEverything; //get an entry using all specifications
    #selEntriesSimpHead;    //get all entry records matching the simplified character headword
    #selEntriesTradHead;    //get all entry records matching the traditional character headword
    #selDefinitions;        //get all entry records matching the id of the entry they belong to
    #delDefinitions;        //delete all definitions that match the id of the entry they belong to

    constructor() {
        //create a SQLite database in memory
        this.db = new Database('./data/dictionary.db');
        try {
            console.log('Database initialized');

            this.#repEntries = this.db.prepare(
                "REPLACE INTO entries (tradChars,simpChars,pinyin,custom) " +
                "VALUES (?, ?, ?, ?);"
            );
            this.#insDefinitions = this.db.prepare(
                "INSERT INTO definitions (dicid,definition) " +
                "VALUES (?, ?);"
            )
            this.#delDefinitions = this.db.prepare(
                "DELETE FROM definitions WHERE dicid=? ;"
            );
            this.#selEntriesFull = this.db.prepare(
                "SELECT * FROM entries WHERE " +
                "tradChars=? AND simpChars=? AND pinyin=? ORDER BY custom DESC;"
            );
            this.#selEntriesEverything = this.db.prepare(
                "SELECT * FROM entries WHERE " +
                "tradChars=? AND simpChars=? AND pinyin=? AND custom=?;"
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
                } else if (tstEntry.custom < entry.custom) {
                    //if they are unique, eliminate the entry in the
                    //lower layer
                    return false;
                } else {
                    return true;
                }
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

    save(tradChars, simpChars, pinyin, defs, level) {
        if (level === DictLevel.CORE) {
            return; //do not modify the core dictionary
        }

        console.log(tradChars);
        console.log(simpChars);
        console.log(pinyin);
        console.log(defs);
        console.log(level);

        //delete associated definitions if they exist
        let oldEntry = this.#selEntriesEverything.get(tradChars, simpChars, pinyin, level);
        if (oldEntry !== undefined) {
            this.#delDefinitions.run(oldEntry.id);
        }

        this.#repEntries.run(tradChars, simpChars, pinyin, level);

        let id = this.applyLayerModel(this.#selEntriesFull.all(tradChars, simpChars, pinyin))[0].id;
        console.log(id);
        this.#delDefinitions.run(id);
        for (let def of defs) {
            this.#insDefinitions.run(id, def);
        }
    }

    close() {
        this.db.close();
    }
}