import {
    addRelClauseToSubject, addStrandedPassive,
    createRelativeNoun, createRosClause, getLexicalizedMod, handleAdverbPhrase,
    handleNounPhrase, isAdjectiveAgr, isAdjectiveMod, isBeVerb, isFocusElement,
    isNominalElement, isNounMod, isPassive, isPredicate, isPreposition,
    isRelative, isRosCondition, isVerbAgr, isVerbMod, modStackContainsCaus,
    removeRelClause,
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
import { AdjectiveBuilder } from "../Builders/AdjectiveBuilder"
import { Clause } from "./partsOfSpeech/Clause"

export class ClauseBuilder {

    private predicate: Predicate | null

    private subject: Noun | null
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]
    private unfinishedBuilderList: WordBuilder[]

    private pendingAdverb: Adverb | null

    constructor() {
        this.predicate = null
        this.subject = null
        this.nounStack = []
        this.adjunctStack = []
        this.unfinishedBuilderList = []
        this.pendingAdverb = null
    }

    public build(): Clause {
        let clause: Clause = new Clause()
        if (!this.subject) {
            throw Error("Tried to build clause without a subject.")
        }
        clause.addNoun(this.subject)
        for (let noun of this.nounStack) {
            clause.addNoun(noun)
        }
        for (let adjunct of this.adjunctStack) {
            clause.addAdjunct(adjunct)
        }
        if (!this.predicate) {
            throw Error("Tried to build clasue without a predicate.")
        }
        clause.setPredicate(this.predicate)
        if (this.pendingAdverb) {
            clause.addAdjunct(this.pendingAdverb)
        }
        return clause
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
            (
                phrase instanceof Adverb ||
                phrase instanceof Preposition
            ) && (
                this.predicate instanceof Predicate
            )
        ) {
            this.predicate.addAdjunct(phrase)
        }
        else if (
            phrase instanceof Adverb ||
            phrase instanceof Preposition
        ) {
            this.pushAdjunctToClause(phrase)
        } else if (phrase instanceof Noun) {
            this.pushNounToClause(phrase)
        }
    }

    public buildAdjective(adjWord: Word): void {
        let adjBuilder: AdjectiveBuilder =
            this.getOrCreateBuilder(AdjectiveBuilder)
        if (isAdjectiveMod(adjWord)) {
            adjBuilder.createAndAddMod(adjWord)
        } else if (isAdjectiveAgr(adjWord)) {
            adjBuilder.createAndAddAgr(adjWord)
        } else {
            this.removeFromBuilderList(adjBuilder)
            adjBuilder.createAndSetAdjective(adjWord)
            if (this.pendingAdverb) {
                adjBuilder.addAdjunct(this.pendingAdverb)
            }
            this.addPhrase(adjBuilder)
        }
    }

    public buildAdverb(adverbWord: Word): void {
        let adverbBuilder: AdverbBuilder =
            this.getOrCreateBuilder(AdverbBuilder)

        this.removeFromBuilderList(adverbBuilder)
        adverbBuilder.createAndSetAdverb(adverbWord)
        if (this.pendingAdverb) {
            this.placeAdverbIn(adverbBuilder)
        }
        let adverb: Adverb = adverbBuilder.build()
        this.pendingAdverb = adverb
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
        if (this.pendingAdverb) {
            this.placeAdverbIn(prepBuilder)
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
                if (this.pendingAdverb) {
                    this.placeAdverbIn(predBuilder)
                }
                this.removeFromBuilderList(predBuilder)
                let predicate: Predicate = predBuilder.build()
                this.pushPredToClause(predicate)
            }
        }
    }

    public buildCausative(causeWord: Word): void {
        if (!this.subject) {
            throw Error("Causative sentence does not have Effector.")
        }
        this.subject.addCausative(causeWord)
        this.buildPredicate(causeWord)
    }

    private placeAdverbIn(builder: WordBuilder): void {
        if (!this.pendingAdverb) {
            throw Error("Tried to set adverb that does not exist.")
        }
        builder.addAdjunct(this.pendingAdverb)
        this.pendingAdverb = null
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

        } else if (!this.subject) {
            this.subject = nPhrase
        } else {
            this.nounStack.push(nPhrase)
        }
    }

    private pushPredToClause(pred: Predicate): void {
        this.predicate = pred
    }

    public receiveSubject(subject: Noun): void {
        this.subject = subject
    }

    public yieldEcmNoun(): Noun {
        let ecmSubject: Noun | undefined = this.nounStack.shift()
        if (!ecmSubject) {
            throw Error(
                "Tried to extract subordinate Subject that does not exist."
            )
        }
        return ecmSubject
    }

    public yieldOControlNoun(): Noun {
        if (this.nounStack.length > 0) {
            return this.nounStack[0]
        }
        if (!this.subject) {
            throw Error("Sentence does not seem to have a subject.")
        }
        return this.subject
    }

    public yieldRaisingNoun(): Noun {
        let subSubject: Noun | undefined = this.nounStack.shift()
        if (subSubject) {
            return subSubject
        }
        if (!this.subject) {
            throw Error("Sentence does not seem to have a subject.")
        }
        return this.subject
    }

    public yieldSControlNoun(): Noun {
        if (!this.subject) {
            throw Error("Sentence does not seem to have a subject.")
        }
        return this.subject
    }

    private removeFromBuilderList(WordBuilder: WordBuilder) {
        this.unfinishedBuilderList = this.unfinishedBuilderList.filter(
            builder => builder !== WordBuilder
        )
    }

    private shouldBePredicate(): boolean {
        let unfinishedBuilder = this.unfinishedBuilderList.at(-1)
        return (
            unfinishedBuilder instanceof PredicateBuilder &&
            unfinishedBuilder.hasCopula()
        )
    }

    // public addPendingAdverbToBuiltPredicate(): void {
    //     if (!this.pendingAdverb || !this.predicate) return
    //     this.predicate.addAdjunct(this.pendingAdverb)
    //     this.pendingAdverb = null
    // }


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

    //         } else if (isVerbalElement(currentWord)) {

    //             let predInfo: {
    //                 pred: Predicate
    //                 experiencer: Noun | null
    //                 adverbStack: Adverb[]
    //             }
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
}