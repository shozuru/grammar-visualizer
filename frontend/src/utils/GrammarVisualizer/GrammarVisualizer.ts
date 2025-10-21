import { Adverb } from "../Syntactic Categories/Adverbs"
import { Noun } from "../Syntactic Categories/Noun"
import { Preposition } from "../Syntactic Categories/Preposition"
import { Verb } from "../Syntactic Categories/Verb"
import { conjunctions, PartsOfSpeech } from "../SyntaxConstants"
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
        this.numberOfClauses = 0
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
        let zippedPair: [number, string][] = []

        for (let i = 0; i < posList.length; i++) {
            zippedPair.push([posList[i], wordList[i]])
        }

        let currentPredicate: Verb | null = null

        // baskets to put elements for each clause
        let clauseNouns: Noun[] = []
        let clauseAdjuncts: (Adverb | Preposition)[] = []

        while (zippedPair.length > 0) {

            let currentPair: [number, string] | undefined = zippedPair.shift()

            if (currentPair !== undefined) {
                if (this.isVerb(currentPair, zippedPair)) {
                    currentPredicate = new Verb(currentPair[1])
                    this.clauses.push(currentPredicate)
                } else if (this.isNoun(currentPair)) {
                    clauseNouns.push(new Noun(currentPair[1]))
                } else if (
                    currentPredicate &&
                    this.isConjunction(currentPair)
                ) {
                    console.log("i am now at a conjunction")
                    for (const noun of clauseNouns) {
                        currentPredicate.addNoun(noun)
                    }
                    for (const modifier of clauseAdjuncts) {
                        currentPredicate.addAdjunct(modifier)
                    }

                    clauseNouns = []
                    clauseAdjuncts = []
                    currentPredicate = null

                } else if (
                    this.isPreposition(currentPair) &&
                    currentPredicate
                ) {
                    const currentPreposition: Preposition =
                        new Preposition(currentPair[1])
                    clauseAdjuncts.push(currentPreposition)
                    let nextWord: [number, string] | undefined =
                        zippedPair.shift()
                    while (nextWord && !this.isNoun(nextWord)) {
                        nextWord = zippedPair.shift()
                    }
                    if (nextWord !== undefined) {
                        const object: Noun = new Noun(nextWord[1])
                        currentPreposition.setObject(object)
                    }
                }
            }
        }

        if (currentPredicate) {
            for (const noun of clauseNouns) {
                currentPredicate.addNoun(noun)
            }
            for (const modifier of clauseAdjuncts) {
                currentPredicate.addAdjunct(modifier)
            }
        }
    }

    // verbs are predicates and predicates are verbs
    private isVerb(
        wordPair: [number, string],
        restOfSent: [number, string][]
    ): boolean {

        const currentPOS: number = wordPair[0]

        if (
            currentPOS === PartsOfSpeech.VB ||
            currentPOS === PartsOfSpeech.VBD ||
            currentPOS === PartsOfSpeech.VBN ||
            currentPOS === PartsOfSpeech.VBP ||
            currentPOS === PartsOfSpeech.VBZ ||
            ((
                currentPOS === PartsOfSpeech.JJ ||
                currentPOS === PartsOfSpeech.JJR ||
                currentPOS === PartsOfSpeech.JJS
            ) && (
                    restOfSent.length > 0 &&
                    (
                        restOfSent[0][0] === PartsOfSpeech.NN ||
                        restOfSent[0][0] === PartsOfSpeech.NNS
                    )
                ))
        ) {
            this.numberOfClauses += 1
            return true
        }
        return false
    }

    private isNoun(wordPair: [number, string]): boolean {
        const currentPOS: number = wordPair[0]
        return (currentPOS === PartsOfSpeech.NN ||
            currentPOS === PartsOfSpeech.NNS ||
            currentPOS === PartsOfSpeech.NNP ||
            currentPOS === PartsOfSpeech.NNPS ||
            currentPOS === PartsOfSpeech.PRP)
    }

    private isPreposition(wordPair: [number, string]): boolean {
        const currentPOS: number = wordPair[0]
        return currentPOS === PartsOfSpeech.IN
    }

    private isConjunction(wordPair: [number, string]): boolean {
        const currentPOS: number = wordPair[0]
        const currentWord: string = wordPair[1]

        return (
            (currentPOS === PartsOfSpeech.IN ||
                currentPOS === PartsOfSpeech.CC ||
                currentPOS === PartsOfSpeech.WR
            ) && (
                conjunctions.has(currentWord)
            )
        )
    }

    private isRelativeClause(wordPair: [number, string]): boolean {
        return false
    }
}


// next steps are to try to identify the main relations between elements per clause
// identify the subjects and objects that go with each clause
// maybe there are possible heuristics we could use for deciding nouns?
// like if it's NOUN VERB NOUN VERB, to assume the second noun is with the second verb?
// almost like onset priority?
// if the second verb doesn't have a noun, then inherit it from the first