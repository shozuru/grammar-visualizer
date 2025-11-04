import { type SentenceInfo } from "./types/SentenceInfo"
import { Sentence } from "./syntax/Sentence"
import type { Word } from "./types/Word"
import { fixPartsOfSpeech } from "./syntax/SyntaxMethods"

export class GrammarVisualizer {

    public sentence: Sentence
    private sentenceWordList: Word[]

    constructor(inputSentence: SentenceInfo) {
        this.sentenceWordList = this.createZippedWords(
            inputSentence.posList,
            inputSentence.wordList
        )
        this.sentenceWordList = fixPartsOfSpeech(this.sentenceWordList)

        this.sentence = new Sentence(
            this.sentenceWordList
        )
        this.sentence.generateClauses()

        console.log(
            `Number of clauses in sentence: ${Sentence.numberOfClauses}`
        )
        console.log(Sentence.clauses)
    }

    private createZippedWords(
        listOfPos: number[],
        listOfWords: string[]
    ): Word[] {
        let zipped: Word[] = []

        for (let i = 0; i < listOfPos.length; i++) {
            let Word: Word = {

                pos: listOfPos[i],
                name: listOfWords[i]
            }
            zipped.push(Word)
        }
        return zipped
    }
}

// TODO: questions, punctuation, conjunctions, relative clauses

// the movie (that) i saw was really good.
// the person that went to spain
// the person (that was) in the bathroom came back
// the person (that was) fired from his job came back
// the man that is a soccer player came back --> the soccer player man came back
// who i knew was great --> the person that I knew was great

// account for adjectives
// I made the game (be) easier

// -----------------------------------------------------------------------------
// experiencer verbs might be super limited
// determining if intransitive verb is unaccusative or unergative might prove 
// more challenging
// might want to look into an ML model that can classify it or make one yourself

// might want to do stuff for case and agreement on nouns and verbs

// for some reason two empty sentences are being submitted on startup