import { type SentenceInfo } from "./types/sentence-info"
import type { Word } from "./types/word"
import { Parser } from "./parser"
import type { Clause } from "./syntax/parts-of-speech/clause"

export class GrammarVisualizer {

    private clauses: Clause[]

    constructor(inputSentence: SentenceInfo) {
        const sentence: Word[] = this.createZippedWords(
            inputSentence.posList,
            inputSentence.wordList
        )
        const parser = new Parser()
        this.clauses = parser.parse(sentence)
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

    public getClauses(): Clause[] {
        return this.clauses
    }
}

// TODO: conjunctions, ambiguous sentences, visualization
// this is an example sentence
// I gave the kid cake. (ambiguous)
// I gave the dog food (technically ambiguous)
// I ate the birthday cake (not ambiguous)
// in most cases, you want to treat DET NN NN as one thing, but if the verb
// is ditransitive, it is ambiguous if it comes after the verb
// DET NN NN

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