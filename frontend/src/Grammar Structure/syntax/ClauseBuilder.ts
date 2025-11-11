import {
    addRelClauseToSubject, addStrandedPassive, createCompleteClause,
    createRelativeNoun, createRosClause, getLexicalizedMod, handleAdverbPhrase,
    handleNounPhrase,
    handlePredicatePhrase, isAdverbAgr, isAdverbElement, isAdverbMod, isBeVerb,
    isFocusElement,
    isNominalElement, isNounMod, isPassive, isPredicate, isPreposition, isRelative, isRosCondition,
    isVerbAgr,
    isVerbMod, modStackContainsCaus, removeRelClause,
} from "./SyntaxMethods"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Noun } from "./partsOfSpeech/Noun"
import { Preposition } from "./partsOfSpeech/Preposition"
import type { Word } from "../types/Word"
import { Predicate } from "./Predicate"
import { Verb } from "./partsOfSpeech/Verb"
import { NounBuilder } from "../Builders/NounBuilder"
import type { WordBuilder } from "../Builders/WordBuilder"
import { PredicateBuilder } from "../Builders/PredicateBuilder"
import { PrepBuilder } from "../Builders/PrepositionBuilder"
import { AdverbBuilder } from "../Builders/AdverbBuilder"
import type { Phrase } from "./partsOfSpeech/Phrase"

export class ClauseBuilder {

    private predicate: Predicate | null

    private subject: Noun | null
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]
    private unfinishedBuilderList: WordBuilder[]
    private pendingAdverbs: Adverb[]

    constructor() {
        this.predicate = null
        this.subject = null
        this.nounStack = []
        this.adjunctStack = []
        this.unfinishedBuilderList = []
        this.pendingAdverbs = []
    }

    public addPhrase(builder: WordBuilder): void {
        let phrase: Phrase = builder.build()
        if (this.shouldBePredicate()) {
            this.makePredicate(phrase)
        } else {
            this.attachToClause(phrase)
        }
    }

    public attachToClause(phrase: Phrase): void {
        if (
            phrase instanceof Adverb ||
            phrase instanceof Preposition
        ) {
            this.pushAdjunctToClause(phrase)
        } else if (phrase instanceof Noun) {
            this.pushNounToClause(phrase)
        }
    }

    public buildAdjective(adjWord: Word): void {

    }

    public buildAdverb(adverbWord: Word): void {
        let adverbBuilder: AdverbBuilder =
            this.getOrCreateBuilder(AdverbBuilder)

        if (isAdverbMod(adverbWord)) {
            adverbBuilder.createAndAddMod(adverbWord)
        } else if (isAdverbAgr(adverbWord)) {
            adverbBuilder.createAndAddAgr(adverbWord)
        } else {
            this.removeFromBuilderList(adverbBuilder)
            adverbBuilder.createAndSetAdverb(adverbWord)

            // very fast
            while (this.pendingAdverbs.length > 0) {
                let adjunct: Adverb = this.pendingAdverbs.pop() as Adverb
                adverbBuilder.addAdjunct(adjunct)
            }
            if (this.shouldBePredicate()) {
                // she is very [fast]
                this.makePredicate(adverbBuilder.build())
            } else {
                this.pendingAdverbs.push(adverbBuilder.build())
            }
            // this.addPhrase(adverbBuilder)
        }
    }

    public buildNominal(nomWord: Word): void {
        let nounBuilder: NounBuilder = this.getOrCreateBuilder(NounBuilder)
        if (isNounMod(nomWord)) {
            nounBuilder.createAndAddMod(nomWord)
        } else {
            this.removeFromBuilderList(nounBuilder)
            nounBuilder.createAndSetNoun(nomWord)
            this.addPhrase(nounBuilder)
        }
    }

    public buildPreposition(prepWord: Word): void {
        let prepBuilder: PrepBuilder = this.getOrCreateBuilder(PrepBuilder)
        prepBuilder.setPreposition(prepWord)
        while (this.pendingAdverbs.length > 0) {
            let adjunct: Adverb = this.pendingAdverbs.pop() as Adverb
            prepBuilder.addAdjunct(adjunct)
        }
    }

    public buildPredicate(predWord: Word): void {
        let predBuilder: PredicateBuilder =
            this.getOrCreateBuilder(PredicateBuilder)
        if (isVerbAgr(predWord)) {
            predBuilder.createAndAddAgr(predWord)
        } else if (isVerbMod(predWord)) {
            predBuilder.createAndAddMod(predWord)
        } else {
            let verb: Verb = new Verb(predWord.name)
            predBuilder.setVerb(verb)

            if (predBuilder.hasSemanticContent()) {
                while (this.pendingAdverbs.length > 0) {

                    // she [quickly] ate
                    this.adjunctStack.push(this.pendingAdverbs.pop() as Adverb)
                }
                this.removeFromBuilderList(predBuilder)
                let predicate: Predicate = predBuilder.build()
                this.pushPredToClause(predicate)
            }
        }
    }

    public getAdjunctStack(): (Preposition | Adverb)[] {
        return this.adjunctStack
    }

    public getPredicate(): Predicate | null {
        return this.predicate
    }

    public getNounStack(): Noun[] {
        return this.nounStack
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

    public getSubject(): Noun | null {
        return this.subject
    }

    private makePredicate(phrase: Phrase): void {
        let predBuilder =
            this.unfinishedBuilderList.splice(-1, 1)[0] as PredicateBuilder
        predBuilder.setSemanticContent(phrase)
        let predPhrase: Predicate = predBuilder.build()
        this.predicate = predPhrase
    }

    private pushAdjunctToClause(adjunctPhrase: Adverb | Preposition): void {
        this.adjunctStack.push(adjunctPhrase)
    }

    private pushNounToClause(nPhrase: Noun): void {
        if (
            this.unfinishedBuilderList.at(-1) instanceof PrepBuilder
        ) {
            let prepBuilder: PrepBuilder =
                this.unfinishedBuilderList.splice(-1, 1)[0] as PrepBuilder

            prepBuilder.setObject(nPhrase)
            this.addPhrase(prepBuilder)

        } else if (!(this.subject instanceof Noun)) {
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

    private shouldBePredicate(): boolean {
        // there is an unfinished builder at -1 that has be as its copula
        let unfinishedBuilder = this.unfinishedBuilderList.at(-1)
        return (
            unfinishedBuilder instanceof PredicateBuilder &&
            unfinishedBuilder.hasCopula()
        )
    }

    public addPendingAdverbsToMainClause(): void {
        while (this.pendingAdverbs.length > 0) {
            let adjunct: Adverb = this.pendingAdverbs.pop() as Adverb
            this.adjunctStack.push(adjunct)
        }
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
}