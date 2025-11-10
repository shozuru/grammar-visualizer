import {
    addRelClauseToSubject, addStrandedPassive, createCompleteClause,
    createRelativeNoun, createRosClause, handleAdverbPhrase,
    handleNounPhrase,
    handlePredicatePhrase, handlePrepositionPhrase, isAdverbElement, isBeVerb,
    isFocusElement,
    isNominalElement, isNounModifier, isPassive, isPreposition, isRelative, isRosCondition,
    isVerbAgr,
    isVerbalElement, isVerbModifier, modStackContainsCaus, removeRelClause,
} from "./SyntaxMethods"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Noun } from "./partsOfSpeech/Noun"
import { Preposition } from "./partsOfSpeech/Preposition"
import type { Word } from "../types/Word"
import { Clause } from "./partsOfSpeech/Clause"
import { Predicate } from "./Predicate"
import { Mod } from "./Mod"
import { Verb } from "./partsOfSpeech/Verb"
import { Agr } from "./Agr"
import { NounBuilder } from "../Builders/NounBuilder"
import type { WordBuilder } from "../Builders/WordBuilder"
import { VerbBuilder } from "../Builders/VerbBuilder"
import { PredicateBuilder } from "../Builders/PredicateBuilder"
import { PrepBuilder } from "../Builders/PrepositionBuilder"
import { AdverbBuilder } from "../Builders/AdverbBuilder"

export class ClauseBuilder {

    // list of completed clauses
    // private clauses: Clause[]
    // private numberOfClauses: number

    // private wordList: Word[]
    private predicate: Predicate | null

    private subject: Noun | null
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]
    private unfinishedBuilderList: WordBuilder[]

    constructor(
        // wordList: Word[]
    ) {

        // this.clauses = []
        // this.numberOfClauses = 0

        // // this.wordList = wordList
        this.predicate = null
        this.subject = null
        this.nounStack = []
        this.adjunctStack = []
        this.unfinishedBuilderList = []
    }

    public buildAdverb(adverbWord: Word): void {
        let adverbBuilder: AdverbBuilder =
            this.getOrCreateBuilder(AdverbBuilder)
        this.removeFromBuilderList(adverbBuilder)
        adverbBuilder.createAndSetAdverb(adverbWord)
        let aPhrase: Adverb = adverbBuilder.build()
        this.pushAdverbToClause(aPhrase)
    }

    public buildNominal(nomWord: Word): void {
        let nounBuilder: NounBuilder = this.getOrCreateBuilder(NounBuilder)
        if (isNounModifier(nomWord)) {
            nounBuilder.createAndAddMod(nomWord)
        } else {
            this.removeFromBuilderList(nounBuilder)
            nounBuilder.createAndSetNoun(nomWord)
            let nPhrase: Noun = nounBuilder.build()
            this.pushNounToClause(nPhrase)
        }
    }

    public buildPreposition(prepWord: Word): void {
        let prepBuilder: PrepBuilder = this.getOrCreateBuilder(PrepBuilder)
        prepBuilder.set(prepWord)
    }

    public buildPredicate(predWord: Word): void {
        let predBuilder: PredicateBuilder =
            this.getOrCreateBuilder(PredicateBuilder)
        if (isVerbAgr(predWord)) {
            predBuilder.createAndAddAgr(predWord)
        } else if (isVerbModifier(predWord)) {
            predBuilder.createAndAddMod(predWord)
        } else {
            this.removeFromBuilderList(predBuilder)
            let verb: Verb = new Verb(predWord.name)
            predBuilder.setPredicate(verb)
            let predicate: Predicate = predBuilder.build()
            this.pushPredToClause(predicate)
        }
    }

    private getOrCreateBuilder<T extends WordBuilder>(
        buildType: new () => T
    ): T {

        let builder: T | undefined =
            this.unfinishedBuilderList.find(
                build => build instanceof buildType
            ) as T | undefined

        if (!builder) {
            builder = new buildType()
            this.unfinishedBuilderList.push(builder)
        }
        return builder
    }

    private pushAdverbToClause(aPhrase: Adverb): void {
        this.adjunctStack.push(aPhrase)
    }

    private pushNounToClause(nPhrase: Noun): void {
        if (
            this.unfinishedBuilderList.at(-1) instanceof PrepBuilder
        ) {
            let prepBuilder: PrepBuilder =
                this.unfinishedBuilderList.splice(-1, 1)[0] as PrepBuilder

            prepBuilder.setObject(nPhrase)
            let pPhrase: Preposition = prepBuilder.build()
            this.adjunctStack.push(pPhrase)
        }
        else if (!(this.subject instanceof Noun)) {
            this.subject = nPhrase
        } else {
            this.nounStack.push(nPhrase)
        }
    }

    private pushPredToClause(pred: Predicate): void {
        this.predicate = pred
    }

    private removeFromBuilderList(WordBuilder: WordBuilder) {
        this.unfinishedBuilderList = this.unfinishedBuilderList.filter(
            builder => builder !== WordBuilder
        )
    }



    // public generateClauses(): void {

    //     while (this.wordList[0]) {

    //         let currentWord: Word = this.wordList[0]
    //         console.log(currentWord)

    //         if (isNominalElement(this.wordList)) {
    //             if (this.currentSubject instanceof Noun &&
    //                 !(
    //                     this.currentPredicate instanceof Predicate ||
    //                     modStackContainsCaus(this.currentSubject.getModifiers())
    //                 )
    //             ) {
    //                 addRelClauseToSubject(this.currentSubject, this.wordList)
    //             } else if (
    //                 isPassive(currentWord) &&
    //                 this.nounStack.some(noun => noun.getName() === 'that')
    //             ) {
    //                 addStrandedPassive(this.wordList, this.nounStack)
    //             } else {
    //                 let nPhrase: Noun =
    //                     handleNounPhrase(this)
    //                 if (this.currentSubject === null) {
    //                     this.currentSubject = nPhrase
    //                 } else {
    //                     this.attachElementCorrectly(nPhrase)
    //                 }
    //             }

    //         } else if (isAdverbElement(currentWord)) {
    //             let adjunctPhrase: Adverb | Preposition | Noun =
    //                 handleAdverbPhrase(this)
    //             this.attachElementCorrectly(adjunctPhrase)

    //         } else if (isPreposition(currentWord)) {
    //             let pPhrase: Preposition =
    //                 handlePrepositionPhrase(this.wordList)
    //             this.attachElementCorrectly(pPhrase)

    //         } else if (isVerbalElement(currentWord)) {

    //             let predInfo: {
    //                 pred: Predicate
    //                 experiencer: Noun | null
    //                 adverbStack: Adverb[]
    //             } =
    //                 handlePredicatePhrase(this)

    //             if (
    //                 // is subject control:
    //                 this.currentPredicate instanceof Predicate &&
    //                 this.currentSubject instanceof Noun
    //             ) {
    //                 // handle subject control
    //                 createCompleteClause(this)
    //                 this.adjunctStack = []
    //                 this.nounStack = []
    //             }

    //             this.currentPredicate = predInfo.pred
    //             this.incrementClauseCounter()

    //             if (predInfo.experiencer instanceof Noun) {
    //                 this.nounStack.push(predInfo.experiencer)
    //             }
    //             if (predInfo.adverbStack.length > 0) {
    //                 this.adjunctStack.push(...predInfo.adverbStack)
    //             }

    //             if (this.currentSubject instanceof Noun &&
    //                 isRosCondition(this.currentPredicate, this.wordList)
    //             ) {

    //                 let ros: {
    //                     clause: Clause
    //                     nextSubject: Noun | null
    //                 } =
    //                     createRosClause(this)
    //                 for (let noun of this.nounStack) {
    //                     ros.clause.addNounToClause(noun)
    //                 }
    //                 this.addClausetoClauseList(ros.clause)
    //                 this.clearCurrentClause()
    //                 if (ros.nextSubject instanceof Noun) {
    //                     this.currentSubject = ros.nextSubject
    //                 }
    //                 // when you deal with tense in general, you can deal with 
    //                 // inf, since you don't deal with tense in the main clause
    //             }

    //         } else if (isRelative(currentWord)) {
    //             if (
    //                 this.currentPredicate instanceof Predicate &&
    //                 this.currentSubject instanceof Noun
    //             ) {
    //                 createCompleteClause(this)
    //                 this.clearCurrentClause()
    //                 let relNoun: Noun = createRelativeNoun(this.wordList)

    //                 if (isNominalElement(this.wordList)) {
    //                     this.nounStack.push(relNoun)
    //                 } else {
    //                     this.currentSubject = relNoun
    //                 }

    //             } else {
    //                 let relClauseWords: Word[] = removeRelClause(this.wordList)
    //                 let relNoun: Noun = createRelativeNoun(relClauseWords)

    //                 let relSentence: ClauseBuilder =
    //                     new ClauseBuilder(relClauseWords)
    //                 if (isNominalElement(relClauseWords)) {
    //                     relSentence.nounStack.push(relNoun)
    //                 } else {
    //                     relSentence.currentSubject = relNoun
    //                 }
    //                 relSentence.generateClauses()
    //             }

    //         } else if (isFocusElement(currentWord)) {
    //             // handleFocusElement(this.wordList)
    //             let focusWord = this.wordList.shift() as Word
    //             console.log(focusWord.name)
    //         }
    //     }
    //     if (
    //         this.currentPredicate &&
    //         this.currentSubject
    //     ) {
    //         createCompleteClause(this)
    //     }
    // }

    // public addClausetoClauseList(clause: Clause): void {
    //     this.clauses.push(clause)
    // }

    // public getClauseList(): Clause[] {
    //     return this.clauses
    // }

    // public incrementClauseCounter(): void {
    //     this.numberOfClauses += 1
    // }

    // public getClauseCounter(): number {
    //     return this.numberOfClauses
    // }

    // public getNounStack(): Noun[] {
    //     return this.nounStack
    // }

    // public setCurrentSubject(noun: Noun): void {
    //     this.currentSubject = noun
    // }

    // public getWordList(): Word[] {
    //     return this.wordList
    // }

    // /**
    //  * Adds phrase as the predicate if the predicate is a dummy verb. 
    //  * Otherwise adds the phrase to the noun list if it is an NP, or to the
    //  * adjunct list if it is an AP or a PP
    //  * @param phrase A phrase to be added to the current clause
    //  */
    // private attachElementCorrectly(phrase: Noun | Adverb | Preposition): void {
    //     if (this.currentPredicate &&
    //         isBeVerb(this.currentPredicate
    //             .getVerb()
    //             .getName()
    //         )
    //     ) {
    //         this.currentPredicate.setSemanticElement(phrase)
    //     } else if (phrase instanceof Noun) {
    //         this.nounStack.push(phrase)
    //     } else {
    //         this.adjunctStack.push(phrase)
    //     }
    // }

    // private clearCurrentClause(): void {
    //     this.adjunctStack = []
    //     this.currentSubject = null
    //     this.currentPredicate = null
    //     this.nounStack = []
    // }

    // public getCurrentPredicate(): Predicate | null {
    //     return this.currentPredicate
    // }

    // public getCurrentSubject(): Noun | null {
    //     return this.currentSubject
    // }

    // public getAdjunctStack(): (Adverb | Preposition)[] {
    //     return this.adjunctStack
    // }
}