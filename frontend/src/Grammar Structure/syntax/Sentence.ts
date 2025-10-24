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

    private posInfo: number[]
    private wordInfo: string[]
    public clauses: Verb[]
    public new_clauses: Clause[]
    public numberOfClauses: number

    constructor(posInfo: number[], wordInfo: string[]) {
        this.posInfo = fixPartsOfSpeech(posInfo, wordInfo)
        this.wordInfo = wordInfo
        this.clauses = []
        this.new_clauses = []
        this.numberOfClauses = 0
    }

    public uncontractSent(): void {
        let posList: number[] = this.posInfo
        let wordList: string[] = this.wordInfo

        let alignedWordList: string[] = []

        // for (const word of wordList) {
        //     if (word === "didn't") {
        //         alignedWordList.push("did")
        //         alignedWordList.push("n't")
        //     } else if (word === "doesn't") {
        //         alignedWordList.push("does")
        //         alignedWordList.push("n't")
        //     } else if (word === "don't") {
        //         alignedWordList.push("do")
        //         alignedWordList.push("n't")
        //     } else if (word === "haven't") {
        //         alignedWordList.push("have")
        //         alignedWordList.push("n't")
        //     } else if (word === "hasn't") {
        //         alignedWordList.push("has")
        //         alignedWordList.push("n't")
        //     } else if (word === "hadn't") {
        //         alignedWordList.push("had")
        //         alignedWordList.push("n't")
        //     } else {
        //         alignedWordList.push(word)
        //     }
        // }

        this.posInfo = posList
        this.wordInfo = wordList
    }

    public generateClauses(): void {

        // create clause object that has verbs and nouns and bits and other bits
        let currentClause: Clause = new Clause()

        let zippedPairs: Pair[] = this.createZippedPairs()

        let currentPredicate: Verb | null = null
        let new_currentPredicate: Clause | null
        let clauseNouns: Noun[] = []
        let clauseAdjuncts: (Adverb | Preposition | Noun)[] = []

        let nounModifiers: string[] = []
        let verbModifiers: string[] = []
        let causativeNoun: Noun | null = null
        let passiveNoun: Noun | null = null

        // the girl wanted to eat right under the bridge
        while (zippedPairs.length > 0) {

            let currentPair: Pair | undefined = zippedPairs.shift()

            if (currentPair !== undefined) {
                if (isNounModifier(currentPair)) {
                    nounModifiers.push(currentPair.name)

                } else if (isVerbModifier(currentPair)) {
                    verbModifiers.push(currentPair.name)

                } else if (
                    clauseNouns.length > 0 &&
                    isCausative(currentPair)
                ) {
                    let agentNoun: Noun = clauseNouns.shift() as Noun
                    clauseAdjuncts.push(
                        addCaustiveModifier(agentNoun, currentPair)
                    )
                } else if (
                    currentPair.pos === PartsOfSpeech.QuestionTense
                ) {
                    let questionModifier: Adverb = new Adverb(currentPair.name)
                    clauseAdjuncts.push(questionModifier)

                } else if (isAdverb(currentPair)) {
                    let modPhrase: Preposition | Adverb =
                        this.resolveAdverbAttachment(
                            currentPair,
                            zippedPairs
                        )
                    clauseAdjuncts.push(modPhrase)

                } else if (isPredicate(currentPair, zippedPairs)) {
                    if (currentPredicate) {
                        this.addMatrixClauseArguments(
                            currentPredicate,
                            clauseNouns
                        )
                        this.addMatrixClauseModifiers(
                            currentPredicate,
                            verbModifiers
                        )
                        verbModifiers.push("inf")
                    }

                    let vPhrase: Verb = new Verb(currentPair.name)
                    this.clauses.push(vPhrase)

                    currentPredicate = vPhrase
                    this.numberOfClauses += 1

                } else if (isNoun(currentPair)) {
                    let nPhrase: Noun =
                        this.createNounPhrase(
                            currentPair,
                            nounModifiers
                        )
                    clauseNouns.push(nPhrase)

                } else if (
                    currentPredicate &&
                    isConjunction(currentPair)
                ) {
                    for (const noun of clauseNouns) {
                        currentPredicate.addNoun(noun)
                    }
                    for (const modifier of clauseAdjuncts) {
                        if (
                            modifier instanceof Adverb ||
                            modifier instanceof Preposition
                        ) {
                            currentPredicate.addAdjunct(modifier)
                        } else if (
                            modifier instanceof Noun
                        ) {
                            currentPredicate.setAgent(modifier)
                        }
                    }

                    // she wanted me to let her eat food

                    clauseNouns = []
                    clauseAdjuncts = []
                    currentPredicate = null

                } else if (
                    isPreposition(currentPair) &&
                    currentPredicate
                ) {
                    let pPhrase: Preposition =
                        this.createPrepositionalPhrase(
                            currentPair,
                            zippedPairs
                        )
                    clauseAdjuncts.push(pPhrase)
                }
            }
        }

        if (currentPredicate) {
            let completeClause: Clause = new Clause()
            completeClause.setPredicate(currentPredicate)

            for (const noun of clauseNouns) {
                currentPredicate.addNoun(noun)
                completeClause.addNounToClause(noun)
            }
            for (const modifier of clauseAdjuncts) {
                if (
                    modifier instanceof Adverb ||
                    modifier instanceof Preposition
                ) {
                    currentPredicate.addAdjunct(modifier)
                    completeClause.addAdjunct(modifier)
                } else if (
                    modifier instanceof Noun
                ) {
                    currentPredicate.setAgent(modifier)
                }
            }

            for (const modifier of verbModifiers) {
                currentPredicate.addTamm(modifier)
                completeClause.addPredicateModifier(modifier)
            }

            this.new_clauses.push(completeClause)
        }
    }

    private addMatrixClauseArguments(
        matrixPredicate: Verb,
        nounArguments: Noun[]
    ) {
        let matrixClause: Clause = new Clause()

        if (
            hasMultipleNouns(nounArguments) &&
            (
                // I expected him to win
                isRaisingVerb(matrixPredicate) ||
                // I saw him win
                isECMVerb(matrixPredicate)
            )
        ) {
            // add first noun to matrix clause
            let matrixSubject: Noun = nounArguments.shift() as Noun
            matrixClause.addNounToClause(matrixSubject)
            matrixPredicate.addNoun(matrixSubject)
        } else if (
            // I asked him to win
            hasMultipleNouns(nounArguments) &&
            isObjectControl(matrixPredicate)
        ) {
            addNounsToObjectControlPred(matrixPredicate, nounArguments)
        } else if (
            // I used him to win
            hasMultipleNouns(nounArguments)
        ) {
            addNounsToSubjectControlPred(matrixPredicate, nounArguments)
        } else {
            // add subject to matrix clause
            let matrixSubject: Noun = nounArguments[0]
            matrixPredicate.addNoun(matrixSubject)
            matrixClause.addNounToClause(matrixSubject)
        }
    }

    private createZippedPairs(): Pair[] {
        let zipped: Pair[] = []

        let listOfPos: number[] = this.posInfo
        let listOfWords: string[] = this.wordInfo

        for (let i = 0; i < listOfPos.length; i++) {
            let pair: Pair = {

                pos: listOfPos[i],
                name: listOfWords[i]
            }
            zipped.push(pair)
        }
        return zipped
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