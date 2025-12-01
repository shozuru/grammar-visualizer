import { type SentenceInfo } from "./types/SentenceInfo"
import type { Word } from "./types/Word"
import { Parser } from "./Parser"
import type { Clause } from "./syntax/partsOfSpeech/Clause"

export class GrammarVisualizer {

    private clauses: Clause[]

    constructor(inputSentence: SentenceInfo) {
        const sentence: Word[] = this.createZippedWords(
            inputSentence.posList,
            inputSentence.wordList
        )
        const parser = new Parser()
        this.clauses = parser.parse(sentence)
        console.log(this.clauses)
    }

    private createZippedWords(
        listOfPos: number[],
        listOfWords: string[]
    ): Word[] {
        const zipped: Word[] = []

        for (let i = 0; i < listOfPos.length; i++) {
            const Word: Word = {

                pos: listOfPos[i],
                name: listOfWords[i].toLowerCase().replace(/[^\w\s]|_/g, '')
            }
            zipped.push(Word)
        }
        return zipped
    }
}

// TODO: questions, punctuation, conjunctions, relative clauses, 
// ambiguous sentences, visualization, stranded prepositions

// yes/no questions
// wh questions with subject WH (no tense promotion)
// wh questions with object WH (tense promotion)

// the man that is a soccer player came back --> the soccer player man came back
// who i knew was great was dead --> the person that I knew was great was dead
// I made the game (be) easier

// make the clauses a private attribute and not static, and just create a helper
// method and add it as an argument when you use it

// create another class to hold your parses ('Sentence')

// need to add for adverbs:
// The boy that slowly walked went to school quickly
// ambiguous:
// the boy that walked [slowly] went to school

// They are at the school that I went to.

// -----------------------------------------------------------------------------

// determining if intransitive verb is unaccusative or unergative might prove 
// challenging
// might want to look into an ML model that can classify it or make one yourself

// might want to do stuff for case and agreement on nouns and verbs

// for some reason two empty sentences are being submitted on startup