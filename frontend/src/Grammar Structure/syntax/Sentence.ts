import {
    addCaustiveModifier,
    addMatrixClauseArguments,
    addMatrixClauseModifiers,
    createNounPhrase,
    createPrepositionalPhrase,
    fixPartsOfSpeech,
    isAdverb, isCausative, isConjunction, isNoun, isNounModifier,
    isPredicate,
    isPreposition,
    isVerbModifier,
    resolveAdverbAttachment,
} from "./SyntaxMethods"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Noun } from "./partsOfSpeech/Noun"
import { Preposition } from "./partsOfSpeech/Preposition"
import { Verb } from "./partsOfSpeech/Verb"
import { PartsOfSpeech, } from "./SyntaxConstants"
import type { Pair } from "../types/Pair"
import { Clause } from "./partsOfSpeech/Clause"

export class Sentence {

    // list of completed clauses
    public clauses: Clause[]
    public numberOfClauses: number

    private wordPairs: Pair[]
    private currentPredicate: Verb | null
    private nounStack: Noun[]
    private nounModStack: string[]
    private adjunctStack: (Preposition | Adverb)[]
    private predModStack: string[]

    constructor(pairList: Pair[]) {
        this.wordPairs = fixPartsOfSpeech(pairList)

        this.clauses = []
        this.numberOfClauses = 0
        this.wordPairs = pairList
        this.currentPredicate = null
        this.predModStack = []
        this.nounStack = []
        this.nounModStack = []
        this.adjunctStack = []

    }

    // public uncontractSent(): void {
    //     let posList: number[] = this.posInfo
    //     let wordList: string[] = this.wordInfo

    //     let alignedWordList: string[] = []

    //     // for (const word of wordList) {
    //     //     if (word === "didn't") {
    //     //         alignedWordList.push("did")
    //     //         alignedWordList.push("n't")
    //     //     } else if (word === "doesn't") {
    //     //         alignedWordList.push("does")
    //     //         alignedWordList.push("n't")
    //     //     } else if (word === "don't") {
    //     //         alignedWordList.push("do")
    //     //         alignedWordList.push("n't")
    //     //     } else if (word === "haven't") {
    //     //         alignedWordList.push("have")
    //     //         alignedWordList.push("n't")
    //     //     } else if (word === "hasn't") {
    //     //         alignedWordList.push("has")
    //     //         alignedWordList.push("n't")
    //     //     } else if (word === "hadn't") {
    //     //         alignedWordList.push("had")
    //     //         alignedWordList.push("n't")
    //     //     } else {
    //     //         alignedWordList.push(word)
    //     //     }
    //     // }

    //     this.posInfo = posList
    //     this.wordInfo = wordList
    // }

    public generateClauses(): void {

        while (this.wordPairs.length > 0) {

            let currentPair: Pair | undefined = this.wordPairs.shift()

            if (currentPair !== undefined) {
                if (isNounModifier(currentPair, this.wordPairs)) {
                    this.nounModStack.push(currentPair.name)

                } else if (isVerbModifier(currentPair)) {
                    this.predModStack.push(currentPair.name)

                } else if (
                    this.nounStack.length > 0 &&
                    isCausative(currentPair)
                ) {
                    let agentNoun: Noun = this.nounStack.pop() as Noun
                    this.nounStack.push(
                        addCaustiveModifier(agentNoun, currentPair)
                    )
                } else if (
                    currentPair.pos === PartsOfSpeech.QuestionTense
                ) {
                    let questionModifier: Adverb = new Adverb(currentPair.name)
                    this.adjunctStack.push(questionModifier)

                } else if (isAdverb(currentPair)) {
                    let modPhrase: Preposition | Adverb =
                        resolveAdverbAttachment(
                            currentPair,
                            this.wordPairs
                        )
                    this.adjunctStack.push(modPhrase)

                } else if (isPredicate(currentPair, this.wordPairs)) {
                    if (this.currentPredicate !== null) {
                        this.handleMatrixClause(this.currentPredicate)
                    }

                    let vPhrase: Verb = new Verb(currentPair.name)
                    this.currentPredicate = vPhrase
                    this.numberOfClauses += 1

                } else if (isNoun(currentPair)) {
                    let nPhrase: Noun =
                        createNounPhrase(
                            currentPair,
                            this.nounModStack
                        )
                    this.nounStack.push(nPhrase)

                } else if (
                    this.currentPredicate &&
                    isConjunction(currentPair)
                ) {
                    let completeClause: Clause = new Clause()

                    for (const noun of this.nounStack) {
                        completeClause.addNounToClause(noun)
                    }
                    for (const modifier of this.adjunctStack) {
                        completeClause.addAdjunct(modifier)
                    }

                    this.nounStack = []
                    this.adjunctStack = []
                    this.currentPredicate = null

                } else if (
                    isPreposition(currentPair) &&
                    this.currentPredicate
                ) {
                    let pPhrase: Preposition =
                        createPrepositionalPhrase(
                            currentPair,
                            this.wordPairs
                        )
                    this.adjunctStack.push(pPhrase)
                }
            }
        }

        if (this.currentPredicate) {
            let completeClause: Clause = new Clause()
            completeClause.setPredicate(this.currentPredicate)

            for (const noun of this.nounStack) {
                if (
                    noun.getModifiers().includes("made") ||
                    noun.getModifiers().includes("make") ||
                    noun.getModifiers().includes("let")
                ) {
                    completeClause.setCausativeNoun(noun)
                } else {
                    completeClause.addNounToClause(noun)
                }
            }
            for (const modifier of this.adjunctStack) {
                completeClause.addAdjunct(modifier)
            }

            for (const modifier of this.predModStack) {
                completeClause.addPredicateModifier(modifier)
            }

            this.clauses.push(completeClause)
        }
    }

    private handleMatrixClause(currentPred: Verb): void {
        this.clauses.push(
            addMatrixClauseArguments(
                currentPred,
                this.nounStack
            )
        )
        addMatrixClauseModifiers(
            currentPred,
            this.predModStack
        )
        this.predModStack.push("inf")
    }
}