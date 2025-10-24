import {
    addCaustiveModifier,
    addNounsToObjectControlPred,
    addNounsToSubjectControlPred,
    fixPartsOfSpeech,
    hasMultipleNouns,
    isAdverb, isCausative, isConjunction, isECMVerb, isNoun, isNounModifier,
    isObjectControl,
    isPredicate,
    isPreposition,
    isRaisingVerb,
    isVerbModifier,
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
    private adjunctStack: (Preposition | Adverb | Noun)[]
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
                        this.resolveAdverbAttachment(
                            currentPair,
                            this.wordPairs
                        )
                    this.adjunctStack.push(modPhrase)

                } else if (isPredicate(currentPair, this.wordPairs)) {
                    if (this.currentPredicate !== null) {
                        this.addMatrixClauseArguments(
                            this.currentPredicate,
                            this.nounStack
                        )
                        this.addMatrixClauseModifiers(
                            this.currentPredicate,
                            this.predModStack
                        )
                        this.predModStack.push("inf")
                    }

                    let vPhrase: Verb = new Verb(currentPair.name)
                    this.currentPredicate = vPhrase
                    this.numberOfClauses += 1

                } else if (isNoun(currentPair)) {
                    let nPhrase: Noun =
                        this.createNounPhrase(
                            currentPair,
                            this.nounModStack
                        )
                    this.nounStack.push(nPhrase)

                } else if (
                    this.currentPredicate &&
                    isConjunction(currentPair)
                ) {
                    for (const noun of this.nounStack) {
                        // this.currentPredicate.addNoun(noun)
                    }
                    for (const modifier of this.adjunctStack) {
                        if (
                            modifier instanceof Adverb ||
                            modifier instanceof Preposition
                        ) {
                            // this.currentPredicate.addAdjunct(modifier)
                        } else if (
                            modifier instanceof Noun
                        ) {
                            // this.currentPredicate.setAgent(modifier)
                        }
                    }

                    this.nounStack = []
                    this.adjunctStack = []
                    this.currentPredicate = null

                } else if (
                    isPreposition(currentPair) &&
                    this.currentPredicate
                ) {
                    let pPhrase: Preposition =
                        this.createPrepositionalPhrase(
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
                if (
                    modifier instanceof Adverb ||
                    modifier instanceof Preposition
                ) {
                    // this.currentPredicate.addAdjunct(modifier)
                    completeClause.addAdjunct(modifier)
                } else if (
                    modifier instanceof Noun
                ) {
                    // this.currentPredicate.setAgent(modifier)
                }
            }

            for (const modifier of this.predModStack) {
                this.currentPredicate.addTamm(modifier)
                completeClause.addPredicateModifier(modifier)
            }

            this.clauses.push(completeClause)
        }
    }

    // this should probably go in the syntax methods module
    private addMatrixClauseArguments(
        matrixPredicate: Verb,
        nounArguments: Noun[]
    ) {
        let matrixClause: Clause = new Clause()
        matrixClause.setPredicate(matrixPredicate)
        if (
            nounArguments[0].getModifiers().includes("make") ||
            nounArguments[0].getModifiers().includes("made") ||
            nounArguments[0].getModifiers().includes("let")
        ) {
            let agentNoun: Noun = nounArguments.shift() as Noun
            matrixClause.setCausativeNoun(agentNoun)
        }

        if (
            hasMultipleNouns(nounArguments) &&
            (
                // I expected him to win
                isRaisingVerb(matrixPredicate) ||
                // I saw him win
                isECMVerb(matrixPredicate)
            )
        ) {
            // move first noun to matrix clause
            let matrixSubject: Noun = nounArguments.shift() as Noun
            matrixClause.addNounToClause(matrixSubject)
        } else if (
            // I asked him to win
            hasMultipleNouns(nounArguments) &&
            isObjectControl(matrixPredicate)
        ) {
            addNounsToObjectControlPred(matrixClause, nounArguments)
        } else if (
            // I used him to win
            hasMultipleNouns(nounArguments)
        ) {
            addNounsToSubjectControlPred(matrixClause, nounArguments)
        } else {
            // copy subject to matrix clause
            let matrixSubject: Noun = nounArguments[0]
            matrixClause.addNounToClause(matrixSubject)
        }

        this.clauses.push(matrixClause)
        console.log(matrixClause)
    }

    private resolveAdverbAttachment(
        adverbPair: Pair,
        listOfNextWords: Pair[]
    ): Preposition | Adverb {

        let thisAdverb: Adverb = new Adverb(adverbPair.name)
        let nextWord: Pair = listOfNextWords[0]

        if (nextWord && isPreposition(nextWord)) {

            // shift off the preposition
            let prepositionPair: Pair = listOfNextWords.shift() as Pair
            // create new preposition using shifted pair
            let currentPreposition: Preposition =
                new Preposition(prepositionPair.name)
            // add adverb to preposition's modifier list
            currentPreposition.addModifier(thisAdverb)
            // add potential following object to preposition
            currentPreposition.tagIfObject(listOfNextWords)
            return currentPreposition

        } else if (nextWord && isAdverb(nextWord)) {

            let nextAdverb: Pair = listOfNextWords.shift() as Pair
            let aPhrase: Adverb = new Adverb(nextAdverb.name)
            aPhrase.addModifier(thisAdverb)
            return aPhrase

        } else {
            return thisAdverb
        }
    }

    private createPrepositionalPhrase(
        prepositionPair: Pair,
        restOfSent: Pair[]
    ): Preposition {
        let prepositionalPhrase: Preposition =
            new Preposition(prepositionPair.name)
        prepositionalPhrase.tagIfObject(restOfSent)

        return prepositionalPhrase
    }

    private createNounPhrase(nounPair: Pair, modifiers: string[]): Noun {
        let nounPhrase: Noun = new Noun(nounPair.name)
        if (modifiers.length > 0) {
            while (modifiers.length > 0) {
                let modifier: string = modifiers.pop() as string
                nounPhrase.addModifier(modifier)
            }
        }
        return nounPhrase
    }

    private addMatrixClauseModifiers(
        matrixPred: Verb, listOfTamms: string[]
    ): void {
        while (listOfTamms.length > 0) {
            let tamm: string = listOfTamms.shift() as string
            matrixPred.addTamm(tamm)
        }
    }
}