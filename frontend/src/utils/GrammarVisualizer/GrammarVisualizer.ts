import { Verb } from "../Syntax/Verb"
import { PartsOfSpeech } from "../SyntaxConstants"
import { type SentenceInfo } from "../SyntaxMethods"
import { PosInfo } from "./PosInfo"
import { WordInfo } from "./WordInfo"

export class GrammarVisualizer {

    private posInfo: PosInfo
    private wordInfo: WordInfo
    private numberOfClauses: number
    private clauses: Verb[]

    constructor(sentInfo: SentenceInfo) {
        this.posInfo = new PosInfo(sentInfo.posList)
        this.wordInfo = new WordInfo(sentInfo.wordList)
        this.numberOfClauses = -1
        this.clauses = []
        this.uncontractSentence(this.wordInfo.getWordList())
        this.fixPartsOfSpeech(this.posInfo, this.wordInfo)

        this.generateClauses(
            this.posInfo.getPOSList(),
            this.wordInfo.getWordList()
        )

        console.log(this.numberOfClauses)
        console.log(this.clauses)
    }

    private uncontractSentence(wordList: string[]): void {

        let alignedWordList: string[] = []

        for (const word of wordList) {
            if (word === "didn't") {
                alignedWordList.push("did")
                alignedWordList.push("n't")
            } else if (word === "doesn't") {
                alignedWordList.push("does")
                alignedWordList.push("n't")
            } else if (word === "don't") {
                alignedWordList.push("do")
                alignedWordList.push("n't")
            } else if (word === "haven't") {
                alignedWordList.push("have")
                alignedWordList.push("n't")
            } else if (word === "hasn't") {
                alignedWordList.push("has")
                alignedWordList.push("n't")
            } else if (word === "hadn't") {
                alignedWordList.push("had")
                alignedWordList.push("n't")
            } else {
                alignedWordList.push(word)
            }
        }

        this.wordInfo.setWordList(alignedWordList)
    }

    private fixPartsOfSpeech(posInfo: PosInfo, wordInfo: WordInfo): void {
        let posList: number[] = posInfo.getPOSList()
        const wordList: string[] = wordInfo.getWordList()

        for (let i = 0; i < wordList.length; i++) {
            if ((
                wordList[i] === "do" ||
                wordList[i] === "does" ||
                wordList[i] === "did"
            ) && (
                    wordList[i + 1] === "n't"
                )
            ) {
                posList[i] = PartsOfSpeech.TENSE

            } else if ((
                wordList[i] === "have" ||
                wordList[i] === "has" ||
                wordList[i] === "had"
            ) && (
                    posList[i + 1] === PartsOfSpeech.RB
                )
            ) {
                posList[i] = PartsOfSpeech.PERFECTIVE

            } else if (
                (
                    wordList[i] === "have" ||
                    wordList[i] === "has" ||
                    wordList[i] === "had"
                ) && (
                    posList[i + 1] == PartsOfSpeech.VBN
                )) {
                posList[i] = PartsOfSpeech.PERFECTIVE
            }
        }
        posInfo.setPOSList(posList)
    }

    private generateClauses(posList: number[], wordList: string[]): void {
        for (let i = 0; i < posList.length; i++) {
            if (
                posList[i] === PartsOfSpeech.VB ||
                posList[i] === PartsOfSpeech.VBD ||
                posList[i] === PartsOfSpeech.VBN ||
                posList[i] === PartsOfSpeech.VBP ||
                posList[i] === PartsOfSpeech.VBZ ||
                ((
                    posList[i] === PartsOfSpeech.JJ ||
                    posList[i] === PartsOfSpeech.JJR ||
                    posList[i] === PartsOfSpeech.JJS
                ) && (
                        posList[i + 1] === PartsOfSpeech.NN ||
                        posList[i + 1] === PartsOfSpeech.NNS
                    ))
            ) {
                this.numberOfClauses += 1
                const verbPhrase: Verb = new Verb(wordList[i])
                this.clauses.push(verbPhrase)
            }
        }
    }
}


// next steps are to try to identify the main relations between elements per clause
// identify the subjects and objects that go with each clause
// maybe there are possible heuristics we could use for deciding nouns?
// like if it's NOUN VERB NOUN VERB, to assume the second noun is with the second verb?
// almost like onset priority?
// if the second verb doesn't have a noun, then inherit it from the first