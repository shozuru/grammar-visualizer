import {
    isAdjectiveAgr, isAdjectiveMod, isNounMod, isVerbAgr, isVerbMod
} from "../syntax/SyntaxMethods"
import { Adverb } from "../syntax/partsOfSpeech/Adverb"
import { Noun } from "../syntax/partsOfSpeech/Noun"
import { Preposition } from "../syntax/partsOfSpeech/Preposition"
import type { Word } from "../types/Word"
import { Predicate } from "../syntax/Predicate"
import { Verb } from "../syntax/partsOfSpeech/Verb"
import { NounBuilder } from "./NounBuilder"
import type { WordBuilder } from "./WordBuilder"
import { PredicateBuilder } from "./PredicateBuilder"
import { PrepBuilder } from "./PrepositionBuilder"
import { AdverbBuilder } from "./AdverbBuilder"
import type { Phrase } from "../syntax/partsOfSpeech/Phrase"
import { AdjectiveBuilder } from "./AdjectiveBuilder"
import { Clause } from "../syntax/partsOfSpeech/Clause"

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
        this.addSubjectTo(clause)
        this.addNounTo(clause)
        this.addAdjunctTo(clause)
        this.addPredicateTo(clause)
        this.addPendingAdverbTo(clause)
        return clause
    }

    private addPredicateTo(clause: Clause): void {
        if (!this.predicate) {
            let unfinishedPred: PredicateBuilder | undefined =
                this.unfinishedBuilderList.find(builder =>
                    builder instanceof PredicateBuilder)
            let pending = this.pendingAdverb
            if (!(unfinishedPred && pending)) {
                throw Error("Tried to build clause without a predicate.")
            }
            this.pendingAdverb = null
            unfinishedPred.setSemanticContent(pending)
            this.predicate = unfinishedPred.build()
        }
        clause.setPredicate(this.predicate)
    }

    private addPendingAdverbTo(clause: Clause): void {
        if (this.pendingAdverb) {
            clause.addAdjunct(this.pendingAdverb)
        }
    }

    private addSubjectTo(clause: Clause): void {
        let subject: Noun | null = this.subject
        if (!subject) {
            throw Error("Tried to build clause without a subject.")
        }
        clause.addNoun(subject)
    }

    private addAdjunctTo(clause: Clause): void {
        for (let adjunct of this.adjunctStack) {
            clause.addAdjunct(adjunct)
        }
    }

    private addNounTo(clause: Clause): void {
        for (let noun of this.nounStack) {
            clause.addNoun(noun)
        }
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
        // when you deal with tense in general, you can deal with 
        // inf, since you don't deal with tense in the main clause
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

    public buildRelative(relWord: Word): void {
        throw Error("I made it here good job so far.")
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
        if (this.subject) {
            throw Error("clause already has subject")
        }
        this.subject = subject
    }

    public receiveRel(relNoun: Noun): void {
        if (!this.subject) {
            this.subject = relNoun
        } else {
            this.nounStack.push(relNoun)
        }
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

    public yieldObjectRel(): Noun {
        if (this.nounStack.length > 0) {
            return this.nounStack[0]
        }

        let pred: Predicate | null = this.predicate
        let content: Phrase | null = pred && pred.getSemanticContent()

        if (content instanceof Noun) return content
        if (content instanceof Preposition) {
            let object = content.getObject()
            if (object) {
                return object
            }
        }
        if (!pred) throw Error("No object available to yield to rel clause")

        let predAdjuncts = pred.getAdjunctStack()
        let lastAdjunct = predAdjuncts.at(-1)

        if (!(lastAdjunct instanceof Preposition)) {
            throw Error("No object available to yield to rel clause")
        }

        let adjunctOb = lastAdjunct.getObject()
        if (!adjunctOb) {
            throw Error("No object available to yield to rel clause")
        }
        return adjunctOb
    }

    public yieldSubjectRel(): Noun {
        if (!this.subject) {
            throw Error("no subject available to yield to rel clause")
        }
        return this.subject
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

    // public generateClauses(): void {

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
    //             }

    //         } else if (isFocusElement(currentWord)) {
    //             // handleFocusElement(this.wordList)
    //             let focusWord = this.wordList.shift() as Word
    //             console.log(focusWord.name)
    //         }
    // }
}