import {
    getBy,
    getVerbFromTense,
    isAdjectiveAgr, isAdjectiveMod, isInfAgr, isNounMod, isVerbAgr, isVerbMod,
    isWHWord
} from "../syntax/syntax-methods"
import { Adverb } from "../syntax/parts-of-speech/adverb"
import { Noun } from "../syntax/parts-of-speech/noun"
import { Preposition } from "../syntax/parts-of-speech/preposition"
import type { Word } from "../types/word"
import { Predicate } from "../syntax/predicate"
import { Verb } from "../syntax/parts-of-speech/verb"
import { NounBuilder } from "./noun-builder"
import type { WordBuilder } from "./word-builder"
import { PredicateBuilder } from "./predicate-builder"
import { PrepBuilder } from "./preposition-builder"
import { AdverbBuilder } from "./adverb-builder"
import type { Phrase } from "../syntax/parts-of-speech/phrase"
import { AdjectiveBuilder } from "./adjective-builder"
import { Clause } from "../syntax/parts-of-speech/clause"
import { Adjective } from "../syntax/parts-of-speech/adjectives"

export class ClauseBuilder {

    private predicate: Predicate | undefined
    private subject: Noun | undefined
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]
    private unfinishedBuilderList: WordBuilder[]
    private pendingAdverb: Adverb | undefined
    private pendingNoun: Noun | undefined
    private ambiguousAdverbs: Adverb[]

    constructor() {
        this.predicate = undefined
        this.subject = undefined
        this.nounStack = []
        this.adjunctStack = []
        this.unfinishedBuilderList = []
        this.pendingAdverb = undefined
        this.pendingNoun = undefined
        this.ambiguousAdverbs = []
    }

    // public API
    public addPhrase(builder: WordBuilder): void {
        const phrase: Phrase = builder.build()
        if (this.shouldBePredicate()) {
            this.makePredicate(phrase)
        } else {
            this.attachToClause(phrase)
        }
    }

    public attachToClause(phrase: Phrase): void {
        if (
            // is post-predicate modifying phrase
            this.isModifyingPhrase(phrase) &&
            this.predicate instanceof Predicate
        ) {
            this.predicate.addAdjunctPhrase(phrase)
        } else if (this.isModifyingPhrase(phrase)) {
            this.pushAdjunctToClause(phrase)
        } else if (phrase instanceof Noun) {
            this.pushNounToClause(phrase)
        }
    }

    public build(): Clause {
        this.handleStrandedPreps()

        const clause = new Clause()
        this.addSubjectTo(clause)
        this.addNounsTo(clause)
        this.addPredicateTo(clause)
        this.addAdjunctsTo(clause)
        this.addPendingAdverbTo(clause)
        this.addPendingNounTo(clause)
        return clause
    }

    public buildAdjective(adjWord: Word): void {
        const adjBuilder = this.getOrCreateBuilder(AdjectiveBuilder)
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

    public buildAdjPredicate(adjWord: Word, advStack: Adverb[]): void {
        if (this.predicate) {
            throw Error("clause already has predicate")
        }
        const copula = new Verb('be')
        const pred = new Predicate(copula)
        const adj = new Adjective(adjWord.name)
        for (const adverb of advStack) {
            pred.addAdjunctPhrase(adverb)
        }
        pred.setSemanticElement(adj)
        this.predicate = pred
    }

    public buildNounPred(nounWord: Word): void {
        if (this.predicate) {
            throw Error("clause already has a predicate")
        }
        const copula = new Verb('be')
        const predBuilder = new PredicateBuilder()
        predBuilder.setVerb(copula)
        this.unfinishedBuilderList.push(predBuilder)
        this.buildNominal(nounWord)
    }

    public buildAdjRelClause(adjWord: Word): ClauseBuilder {
        const pred = this.buildAdjPred(adjWord)
        const relClause = new ClauseBuilder()
        relClause.predicate = pred

        const lastBuilder = this.unfinishedBuilderList.at(-1)
        if (lastBuilder instanceof NounBuilder) {
            relClause.unfinishedBuilderList.push(lastBuilder)
        }
        return relClause
    }

    public buildAdverb(adverbWord: Word): void {
        const adverbBuilder = this.getOrCreateBuilder(AdverbBuilder)
        this.removeFromBuilderList(adverbBuilder)
        adverbBuilder.createAndSetAdverb(adverbWord)

        const predicate = this.getPredicate()
        if (
            predicate
            && !!predicate.getSemanticContent()
        ) {
            const adverb = adverbBuilder.build()
            this.ambiguousAdverbs.push(adverb)

        } else {
            if (this.pendingAdverb) {
                this.placeAdverbIn(adverbBuilder)
            }

            const adverb = adverbBuilder.build()
            this.pendingAdverb = adverb
        }
    }

    // public buildCausative(causeWord: Word): void {
    //     if (!this.subject) {
    //         throw Error("Causative sentence does not have Effector.")
    //     }
    //     this.subject.addCausative(causeWord)
    //     this.buildPredicate(causeWord)
    // }

    public buildNominal(nomWord: Word): void {
        const nounBuilder = this.getOrCreateBuilder(NounBuilder)
        if (isNounMod(nomWord)) {
            nounBuilder.createAndAddMod(nomWord)
        } else {
            this.removeFromBuilderList(nounBuilder)
            nounBuilder.createAndSetNoun(nomWord)
            this.addPhrase(nounBuilder)
        }
    }

    public buildPredicate(predWord: Word): void {
        // debugger
        // when you deal with tense in general, you can deal with 
        // inf, since you don't deal with tense in the main clause

        const predBuilder = this.getOrCreateBuilder(PredicateBuilder)

        if (isVerbAgr(predWord)) {
            predBuilder.createAndAddAgr(predWord)
            this.handleWHRelWord(predWord)
        } else if (isVerbMod(predWord)) {
            predBuilder.createAndAddMod(predWord)
        } else {
            this.createPred(predBuilder, predWord)
        }
        // if it is not a non-finite clause without dependent case
        this.makePendingNounSubject()
    }

    public buildPreposition(prepWord: Word): void {
        const prepBuilder = this.getOrCreateBuilder(PrepBuilder)
        prepBuilder.setPreposition(prepWord)
        if (this.pendingAdverb) {
            this.placeAdverbIn(prepBuilder)
        }
    }

    public buildPrepWithoutObject(): void {
        const pBuilder = this.getUnfinishedPrep()
        if (!pBuilder) {
            throw Error("trid to build prep but none are unfinished")
        }
        this.addPhrase(pBuilder)
    }

    public getNounStack(): Noun[] {
        return this.nounStack
    }

    public getPendingNoun(): Noun | undefined {
        return this.pendingNoun
    }

    public getPredicate(): Predicate | undefined {
        return this.predicate
    }

    public getSubject(): Noun | undefined {
        return this.subject
    }

    public getUnfinishedPredicate(): Predicate | undefined {
        const pBuilder = this.getUnfinishedPredBuilder()
        if (!pBuilder) return undefined
        return pBuilder.getPred()
    }

    public getUnfinishedPrep(): PrepBuilder | undefined {
        const prep = this.unfinishedBuilderList.find(
            builder => builder instanceof PrepBuilder
        )
        if (prep) this.removeFromBuilderList(prep)
        return prep
    }

    public hasPrepWithObject(): boolean {
        const predicate = this.predicate
        if (!predicate) return false

        const adjunctStack = predicate.getAdjunctStack()

        for (const adjunct of adjunctStack) {
            if (
                adjunct instanceof Preposition
                && adjunct.hasObject()
            ) return true
        }
        return false
    }

    public hasObject(): boolean {
        return this.nounStack.length > 0
    }

    public hasUnfinishedPredicate(): boolean {
        return this.getUnfinishedPredBuilder() !== undefined
    }

    public hasUnfinishedPrep(): boolean {
        const builder = this.unfinishedBuilderList.find(
            builder => builder instanceof PrepBuilder
        )
        return !!builder
    }

    public isLastBuilderNoun(): boolean {
        const bList = this.unfinishedBuilderList
        return bList.at(-1) instanceof NounBuilder
    }

    public receiveRelAdjunct(relAdjunct: Noun): void {
        const adjunctPhrase = new PrepBuilder()
        adjunctPhrase.setGenericPrep("LOCATION")
        adjunctPhrase.setObject(relAdjunct)
        this.addPhrase(adjunctPhrase)
    }

    public receiveAmbiguousAdverbs(adverbList: Adverb[]): void {
        for (const adverb of adverbList) {
            this.adjunctStack.push(adverb)
        }
    }

    public receiveRelNoun(relNoun: Noun): void {
        this.pendingNoun = relNoun
    }

    public receiveRelPrep(noun: Noun, relPrep: PrepBuilder): void {
        relPrep.setObject(noun)
        this.addPhrase(relPrep)
    }

    public receiveSubject(subject: Noun): void {
        if (this.subject) {
            throw Error("clause already has subject")
        }
        this.subject = subject
    }

    public verbInProgress(): boolean {
        return this.unfinishedBuilderList.some(
            builder => builder instanceof PredicateBuilder
        )
    }

    public yieldAmbiguousAdverbs(): Adverb[] {
        return this.ambiguousAdverbs
    }

    public yieldEcmNoun(): Noun {
        const ecmSubject = this.nounStack.shift()
        if (!ecmSubject) {
            throw Error(
                "Tried to extract subordinate Subject that does not exist."
            )
        }
        return ecmSubject
    }

    public yieldLastNoun(): Noun {
        const lastNoun = this.nounStack.pop()
        if (!lastNoun) {
            throw Error("Only noun to yeild seems to be the subject")
        }
        return lastNoun
    }

    public yieldLastPrepObject(): Noun {
        const predicate = this.predicate
        if (!predicate) {
            throw Error(
                "unable to get preposition because there is no predicate"
            )
        }

        const adjunctStack = predicate.getAdjunctStack()

        for (let i = adjunctStack.length - 1; i >= 0; i--) {
            const adjunct = adjunctStack[i]
            if (!(adjunct instanceof Preposition)) continue
            const object = adjunct.getObject()
            if (!object) continue
            adjunct.clearObject()
            return object
        }
        throw Error("No prepositions with objects in adjunct stack")
    }

    public yieldObjectRel(): Noun | undefined {
        if (this.nounStack.length > 0) {
            return this.nounStack[0]
        }

        const pred = this.predicate
        const content = pred && pred.getSemanticContent()

        if (content instanceof Noun) return content
        if (content instanceof Preposition) {
            const object = content.getObject()
            if (object) {
                return object
            }
        }
        if (!pred) return undefined

        const predAdjuncts = pred.getAdjunctStack()
        const lastAdjunct = predAdjuncts.at(-1)

        if (!(lastAdjunct instanceof Preposition)) return undefined

        const adjunctOb = lastAdjunct.getObject()
        if (!adjunctOb) return undefined
        return adjunctOb
    }

    public yieldOControlNoun(): Noun {
        const lastObject = this.nounStack.at(-1)
        if (lastObject) return lastObject
        if (!this.subject) {
            throw Error("matrix clause does not have any nouns to yield")
        }
        return this.subject
    }

    public yieldRaisingNoun(): Noun {
        const lastObject = this.nounStack.pop()
        if (lastObject) return lastObject
        if (!this.subject) {
            throw Error("no noun to yield from raising predicate")
        }
        return this.subject
    }

    public yieldSControlNoun(): Noun {
        if (!this.subject) {
            throw Error("matrix clause doesn't have subject to yeild")
        }
        return this.subject
    }

    public yieldSubjectRel(): Noun {
        if (!this.subject) {
            throw Error("no subject available to yield to rel clause")
        }
        return this.subject
    }

    // private helper methods
    private addAdjunctsTo(clause: Clause): void {
        const pred = clause.getPredicate()
        for (const adjunct of this.adjunctStack) {
            pred.addAdjunctPhrase(adjunct)
        }
    }

    private addNounsTo(clause: Clause): void {
        // debugger
        if (!this.predicate && this.pendingNoun) {
            // Today is when we got the news
            // She is who won
            // I know where to make it
            const predBuilder = this.getUnfinishedPredBuilder()
            if (!predBuilder) {
                throw Error(
                    "Clause has no predicate and no unfinished ones either"
                )
            }
            if (!(predBuilder.hasCopula())) {
                throw Error("the predicate is not the right shape for this")
            }
            predBuilder.setSemanticContent(this.pendingNoun)
            const predicate = predBuilder.build()
            this.predicate = predicate

        } else if (this.pendingNoun) {
            this.nounStack.push(this.pendingNoun)
        }
        this.pendingNoun = undefined

        for (const noun of this.nounStack) {
            clause.addNoun(noun)
        }
    }

    private addPendingAdverbTo(clause: Clause): void {
        const pred = clause.getPredicate()
        if (this.pendingAdverb) {
            pred.addAdjunctPhrase(this.pendingAdverb)
        }
    }

    private addPendingNounTo(clause: Clause): void {
        if (!this.pendingNoun) return
        clause.addNoun(this.pendingNoun)
    }

    private addPredicateTo(clause: Clause): void {
        if (this.predicate) {
            clause.setPredicate(this.predicate)
            return
        }

        const unfinishedPred = this.unfinishedBuilderList.find(
            builder => builder instanceof PredicateBuilder)
        const pending = this.pendingAdverb
        if (unfinishedPred && pending) {
            this.pendingAdverb = undefined
            unfinishedPred.setSemanticContent(pending)
            clause.setPredicate(unfinishedPred.build())
            return
        }
        if (!unfinishedPred) {
            throw Error("Tried to build clause without a predicate.")
        }
        this.handleDoQuestion(clause, unfinishedPred)
    }

    private addSubjectTo(clause: Clause): void {
        const subject = this.subject
        if (!subject) {
            throw Error("Tried to build clause with no subject.")
        }
        clause.addNoun(subject)
    }

    private buildAdjPred(adjWord: Word): Predicate {
        const verb = new Verb('be')
        const pred = new Predicate(verb)
        const adj = new Adjective(adjWord.name)
        pred.setSemanticElement(adj)
        if (this.pendingAdverb) {
            pred.addAdjunctPhrase(this.pendingAdverb)
            this.pendingAdverb = undefined
        }
        return pred
    }

    private createPred(pBuilder: PredicateBuilder, pWord: Word): void {
        const verb = new Verb(pWord.name)
        pBuilder.setVerb(verb)
        if (pBuilder.hasSemanticContent()) {
            if (this.pendingAdverb) {
                this.placeAdverbIn(pBuilder)
            }
            this.removeFromBuilderList(pBuilder)
            const predicate = pBuilder.build()
            this.predicate = predicate
        }
    }

    private getOrCreateBuilder<T extends WordBuilder>(
        buildType: new () => T
    ): T {

        let builder = this.unfinishedBuilderList.find(
            build => build instanceof buildType
        ) as T | undefined

        if (!builder) {
            builder = new buildType()
            this.unfinishedBuilderList.push(builder)
        }
        return builder
    }

    private getUnfinishedPredBuilder(): PredicateBuilder | undefined {
        const builder = this.unfinishedBuilderList.find(
            builder => builder instanceof PredicateBuilder
        )
        return builder
    }

    private handleDoQuestion(
        clause: Clause,
        pBuilder: PredicateBuilder
    ): void {
        const whWord = clause.getNouns().find(noun => isWHWord(noun.getName()))
        const verb = getVerbFromTense(pBuilder)

        if (whWord && verb) {
            pBuilder.setVerb(verb)
            clause.setPredicate(pBuilder.build())
        }
    }

    private handleStrandedBy(bList: WordBuilder[]): void {
        const nounStack = this.nounStack
        getBy(bList, nounStack)
    }

    private handleStrandedPreps(): void {
        const unfinished = this.unfinishedBuilderList
        this.handleStrandedBy(unfinished)

        const pBuilder = this.getUnfinishedPrep()
        if (pBuilder) {
            this.resolvePrep(pBuilder)
        }
    }

    private handleWHRelWord(predWord: Word): void {
        if (!this.pendingNoun) return
        const nounName = this.pendingNoun.getName()
        if (isInfAgr(predWord) && isWHWord(nounName)) {
            throw Error("I made it here so far")
        }
    }

    private isModifyingPhrase(phrase: Phrase): boolean {
        return (
            phrase instanceof Adverb ||
            phrase instanceof Preposition
        )
    }

    private makePredicate(phrase: Phrase): void {
        const predBuilder =
            this.unfinishedBuilderList.splice(-1, 1)[0] as PredicateBuilder
        predBuilder.setSemanticContent(phrase)
        const predPhrase = predBuilder.build()
        this.predicate = predPhrase
    }

    private makePendingNounSubject(): void {
        if (!this.pendingNoun) {
            return
        }
        if (!this.subject) {
            this.subject = this.pendingNoun
            this.pendingNoun = undefined
        }
    }

    private placeAdverbIn(builder: WordBuilder): void {
        if (!this.pendingAdverb) {
            throw Error("Tried to set adverb that does not exist.")
        }
        builder.addAdjunct(this.pendingAdverb)
        this.pendingAdverb = undefined
    }

    private pushAdjunctToClause(phrase: Phrase): void {
        if (!(
            phrase instanceof Adverb
            || phrase instanceof Preposition
        )) {
            throw Error("Tried to push adjunct that is not an adjunct phrase")
        }
        this.adjunctStack.push(phrase)
    }

    private pushNounToClause(nPhrase: Noun): void {
        if (
            this.unfinishedBuilderList.at(-1) instanceof PrepBuilder
        ) {
            const prepBuilder =
                this.unfinishedBuilderList.splice(-1, 1)[0] as PrepBuilder
            prepBuilder.setObject(nPhrase)
            this.addPhrase(prepBuilder)

        } else if (!this.subject) {
            this.subject = nPhrase
        } else {
            this.nounStack.push(nPhrase)
        }
    }

    private removeFromBuilderList(WordBuilder: WordBuilder) {
        this.unfinishedBuilderList = this.unfinishedBuilderList.filter(
            builder => builder !== WordBuilder
        )
    }

    private resolvePrep(builder: PrepBuilder): void {

        if (this.pendingNoun) {
            // They are at the school that I went [to]
            builder.setObject(this.pendingNoun)
            this.pendingNoun = undefined

        } else if (this.subject) {
            builder.setObject(this.subject)
        }

        const pPhrase = builder.build()
        this.adjunctStack.push(pPhrase)
    }

    private shouldBePredicate(): boolean {
        const unfinishedBuilder = this.unfinishedBuilderList.at(-1)
        return (
            unfinishedBuilder instanceof PredicateBuilder &&
            unfinishedBuilder.hasCopula()
        )
    }
}