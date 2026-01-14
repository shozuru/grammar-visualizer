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
// and then work on 'my house [was] haunted'
// He was who needed to go
// yesterday was when we got the news


// TODO: conjunctions, ambiguous sentences, visualization
// I gave the kid cake. (ambiguous)
// I gave the dog food (technically ambiguous)
// I ate the birthday cake (not ambiguous)

// the man that is a soccer player came back --> the soccer player man came back
// I made the game (be) easier

// need to add for adverbs:
// The boy that slowly walked went to school quickly
// ambiguous:
// the boy that walked [slowly] went to school

// [one of] the boys ate a sandwich

// I knew (that) she quickly left
// I told him (that) she quickly left
// solution: we add the nouns as if they are part of the previous clause, but
// if we get to a new verb that doesn't have any nouns, we move the last noun
// of the previous clause to the new clause, and build the previous clause
// we have to move any adverbs that were misplaced as well and probably 
// prepositional phrases

// -----------------------------------------------------------------------------

// determining if intransitive verb is unaccusative or unergative might prove 
// challenging
// might want to look into an ML model that can classify it or make one yourself

// might want to do stuff for case and agreement on nouns and verbs

// for some reason two empty sentences are being submitted on startup