import {
    createRosClause,
    fixPartsOfSpeech,
    handleAdverbPhrase,
    handleNounPhrase,
    handlePredicatePhrase,
    handlePrepositionPhrase,
    isAdverbElement, isBeVerb,
    isNominalElement,
    isPreposition,
    isRosVerb,
    isVerbalElement,
} from "./SyntaxMethods"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Noun } from "./partsOfSpeech/Noun"
import { Preposition } from "./partsOfSpeech/Preposition"
import type { Word } from "../types/Word"
import { Clause } from "./partsOfSpeech/Clause"
import { Predicate } from "./Predicate"

export class Sentence {

    // list of completed clauses
    public clauses: Clause[]
    public numberOfClauses: number

    private wordList: Word[]

    private currentPredicate: Predicate | null
    private currentSubject: Noun | null
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]

    constructor(wordList: Word[]) {
        this.wordList = fixPartsOfSpeech(wordList)

        this.clauses = []
        this.numberOfClauses = 0
        this.wordList = wordList

        this.currentPredicate = null
        this.currentSubject = null
        this.nounStack = []
        this.adjunctStack = []
    }

    public generateClauses(): void {

        while (this.wordList[0]) {

            let currentWord: Word = this.wordList[0]
            console.log(currentWord)

            if (isNominalElement(this.wordList)) {
                let nPhrase: Noun = handleNounPhrase(this.wordList)
                if (this.currentSubject === null) {
                    this.currentSubject = nPhrase
                } else {
                    this.attachElementCorrectly(nPhrase)
                }

            } else if (isAdverbElement(currentWord)) {
                let adjunctPhrase: Adverb | Preposition =
                    handleAdverbPhrase(this.wordList)
                this.attachElementCorrectly(adjunctPhrase)

            } else if (isPreposition(currentWord)) {
                let pPhrase: Preposition =
                    handlePrepositionPhrase(this.wordList)
                this.attachElementCorrectly(pPhrase)

            } else if (isVerbalElement(currentWord)) {

                let predInfo: {
                    pred: Predicate
                    experiencer: Noun | null
                } =
                    handlePredicatePhrase(this.currentSubject, this.wordList)

                if (this.currentPredicate instanceof Predicate) {
                    // handle subject control
                    this.createCompleteClause()
                    this.adjunctStack = []
                    this.nounStack = []

                    // addInfModToPred(pred)
                }

                this.currentPredicate = predInfo.pred
                this.numberOfClauses += 1
                if (predInfo.experiencer instanceof Noun) {
                    this.nounStack.push(predInfo.experiencer)
                }
                if (
                    this.currentSubject instanceof Noun &&
                    isRosVerb(this.currentPredicate)
                ) {

                    let ros: {
                        clause: Clause
                        nextSubject: Noun | null
                    } =
                        createRosClause(
                            this.currentPredicate,
                            this.currentSubject,
                            this.adjunctStack,
                            this.wordList
                        )
                    this.clauses.push(ros.clause)
                    this.clearCurrentClause()
                    if (ros.nextSubject instanceof Noun) {
                        this.currentSubject = ros.nextSubject
                    }

                    // when you deal with tense in general, you can deal with 
                    // inf, since you don't deal with tense in the main clause
                }
            }
        }
        this.createCompleteClause()
    }

    private createCompleteClause(): void {
        if (
            this.currentPredicate instanceof Predicate &&
            this.currentSubject instanceof Noun
        ) {
            let completeClause: Clause = new Clause(this.currentPredicate)
            completeClause.addNounToClause(this.currentSubject)

            for (let noun of this.nounStack) {
                completeClause.addNounToClause(noun)
            }
            for (let adjunct of this.adjunctStack) {
                completeClause.addAdjunct(adjunct)
            }
            this.clauses.push(completeClause)
        }

        //        
        //             if (noun.getModifiers().some(
        //                 mod =>
        //                     mod.getName() === "made" ||
        //                     mod.getName() === "make" ||
        //                     mod.getName() === "let")
        //             ) {
        //                 completeClause.setCausativeNoun(noun)
        //             } 
        //         }
        //       
    }


    /**
     * Adds phrase as the predicate if the predicate is a dummy verb. 
     * Otherwise adds the phrase to the noun list if it is an NP, or to the
     * adjunct list if it is an AP or a PP
     * @param phrase A phrase to be added to the current clause
     */
    private attachElementCorrectly(phrase: Noun | Adverb | Preposition): void {
        if (this.currentPredicate &&
            isBeVerb(this.currentPredicate
                .getVerb()
                .getName()
            )
        ) {
            this.currentPredicate.setSemanticElement(phrase)
        } else if (phrase instanceof Noun) {
            this.nounStack.push(phrase)
        } else {
            this.adjunctStack.push(phrase)
        }
    }

    private clearCurrentClause(): void {
        this.adjunctStack = []
        this.currentSubject = null
        this.currentPredicate = null
        this.nounStack = []
    }
}