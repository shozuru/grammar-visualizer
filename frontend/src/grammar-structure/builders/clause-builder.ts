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

    private predicate: Predicate | null
    private subject: Noun | null
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]
    private unfinishedBuilderList: WordBuilder[]
    private pendingAdverb: Adverb | null
    private pendingNoun: Noun | null
    private ambiguousAdverbs: Adverb[]

    constructor() {
        this.predicate = null
        this.subject = null
        this.nounStack = []
        this.adjunctStack = []
        this.unfinishedBuilderList = []
        this.pendingAdverb = null
        this.pendingNoun = null
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

        const clause: Clause = new Clause()
        this.addSubjectTo(clause)
        this.addNounsTo(clause)
        this.addPredicateTo(clause)
        this.addAdjunctsTo(clause)
        this.addPendingAdverbTo(clause)
        return clause
    }

    public buildAdjective(adjWord: Word): void {
        const adjBuilder: AdjectiveBuilder =
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

    public buildAdjRelClause(adjWord: Word): ClauseBuilder {
        const pred: Predicate = this.buildAdjPred(adjWord)
        const relClause: ClauseBuilder = new ClauseBuilder()
        relClause.predicate = pred

        const lastBuilder: WordBuilder | undefined =
            this.unfinishedBuilderList.at(-1)
        if (lastBuilder instanceof NounBuilder) {
            relClause.unfinishedBuilderList.push(lastBuilder)
        }
        return relClause
    }

    public buildAdverb(adverbWord: Word): void {
        const adverbBuilder: AdverbBuilder =
            this.getOrCreateBuilder(AdverbBuilder)
        this.removeFromBuilderList(adverbBuilder)
        adverbBuilder.createAndSetAdverb(adverbWord)

        const predicate: Predicate | null = this.getPredicate()
        if (
            predicate
            && !!predicate.getSemanticContent()
        ) {
            const adverb: Adverb = adverbBuilder.build()
            this.ambiguousAdverbs.push(adverb)

        } else {
            if (this.pendingAdverb) {
                this.placeAdverbIn(adverbBuilder)
            }

            const adverb: Adverb = adverbBuilder.build()
            this.pendingAdverb = adverb
        }
    }

    public buildCausative(causeWord: Word): void {
        if (!this.subject) {
            throw Error("Causative sentence does not have Effector.")
        }
        this.subject.addCausative(causeWord)
        this.buildPredicate(causeWord)
    }

    public buildNominal(nomWord: Word): void {
        const nounBuilder: NounBuilder = this.getOrCreateBuilder(NounBuilder)
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

        const predBuilder: PredicateBuilder =
            this.getOrCreateBuilder(PredicateBuilder)

        if (isVerbAgr(predWord)) {
            predBuilder.createAndAddAgr(predWord)
            this.handleWHRelWord(predWord)
        } else if (isVerbMod(predWord)) {
            predBuilder.createAndAddMod(predWord)
        } else {
            this.createPred(predBuilder, predWord)
        }

        this.makePendingNounSubject()
    }

    public buildPreposition(prepWord: Word): void {
        const prepBuilder: PrepBuilder = this.getOrCreateBuilder(PrepBuilder)
        prepBuilder.setPreposition(prepWord)
        if (this.pendingAdverb) {
            this.placeAdverbIn(prepBuilder)
        }
    }

    public getNounStack(): Noun[] {
        return this.nounStack
    }

    public getPendingNoun(): Noun | null {
        return this.pendingNoun
    }

    public getPredicate(): Predicate | null {
        return this.predicate
    }

    public getSubject(): Noun | null {
        return this.subject
    }

    public getUnfinishedPredicate(): Predicate | null {
        const pBuilder: PredicateBuilder | undefined =
            this.getUnfinishedPredBuilder()
        if (!pBuilder) return null
        return pBuilder.getPred()
    }

    public getUnfinishedPrep(): PrepBuilder | undefined {
        const prep: PrepBuilder | undefined = this.unfinishedBuilderList.find(
            builder => builder instanceof PrepBuilder
        )
        if (prep) this.removeFromBuilderList(prep)
        return prep
    }

    public hasPrepWithObject(): boolean {
        const predicate: Predicate | null = this.predicate
        if (!predicate) return false

        const adjunctStack: (Preposition | Adverb)[] =
            predicate.getAdjunctStack()

        for (const adjunct of adjunctStack) {
            if (
                adjunct instanceof Preposition
                && adjunct.hasObject()
            ) return true
        }
        return false
    }

    public hasUnfinishedPredicate(): boolean {
        return this.getUnfinishedPredBuilder() !== undefined
    }

    public hasUnfinishedPrep(): boolean {
        const builder: PrepBuilder | undefined =
            this.unfinishedBuilderList.find(
                builder => builder instanceof PrepBuilder
            )
        return !!builder
    }

    public isLastBuilderNoun(): boolean {
        const bList: WordBuilder[] = this.unfinishedBuilderList
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
        const ecmSubject: Noun | undefined = this.nounStack.shift()
        if (!ecmSubject) {
            throw Error(
                "Tried to extract subordinate Subject that does not exist."
            )
        }
        return ecmSubject
    }

    public yieldLastNoun(): Noun {
        const lastNoun: Noun | undefined = this.nounStack.pop()
        if (!lastNoun) {
            throw Error("Only noun to yeild seems to be the subject")
        }
        return lastNoun
    }

    public yieldLastPrepObject(): Noun {
        const predicate: Predicate | null = this.predicate
        if (!predicate) {
            throw Error(
                "unable to get preposition because there is no predicate"
            )
        }

        const adjunctStack: (Adverb | Preposition)[] =
            predicate.getAdjunctStack()

        for (let i = adjunctStack.length - 1; i >= 0; i--) {
            const adjunct: Preposition | Adverb = adjunctStack[i]
            if (!(adjunct instanceof Preposition)) continue
            const object: Noun | null = adjunct.getObject()
            if (!object) continue
            adjunct.clearObject()
            return object
        }
        throw Error("No prepositions with objects in adjunct stack")
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

    public yieldObjectRel(): Noun | null {
        if (this.nounStack.length > 0) {
            return this.nounStack[0]
        }

        const pred: Predicate | null = this.predicate
        const content: Phrase | null = pred && pred.getSemanticContent()

        if (content instanceof Noun) return content
        if (content instanceof Preposition) {
            const object = content.getObject()
            if (object) {
                return object
            }
        }
        if (!pred) return null

        const predAdjuncts = pred.getAdjunctStack()
        const lastAdjunct = predAdjuncts.at(-1)

        if (!(lastAdjunct instanceof Preposition)) return null

        const adjunctOb = lastAdjunct.getObject()
        if (!adjunctOb) return null
        return adjunctOb
    }

    public yieldRaisingNoun(): Noun {
        const subSubject: Noun | undefined = this.nounStack.shift()
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
        if (this.pendingNoun) {
            this.nounStack.push(this.pendingNoun)
            this.pendingNoun = null
        }
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

    private addPredicateTo(clause: Clause): void {
        if (this.predicate) {
            clause.setPredicate(this.predicate)
            return
        }

        const unfinishedPred: PredicateBuilder | undefined =
            this.unfinishedBuilderList.find(builder =>
                builder instanceof PredicateBuilder)
        const pending = this.pendingAdverb
        if (unfinishedPred && pending) {
            this.pendingAdverb = null
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
        const subject: Noun | null = this.subject
        if (!subject) {
            throw Error("Tried to build clause without a subject.")
        }
        clause.addNoun(subject)
    }

    private buildAdjPred(adjWord: Word): Predicate {
        const verb = new Verb('be')
        const pred = new Predicate(verb)
        const adj: Adjective = new Adjective(adjWord.name)
        pred.setSemanticElement(adj)
        if (this.pendingAdverb) {
            pred.addAdjunctPhrase(this.pendingAdverb)
            this.pendingAdverb = null
        }
        return pred
    }

    private createPred(pBuilder: PredicateBuilder, pWord: Word): void {
        const verb: Verb = new Verb(pWord.name)
        pBuilder.setVerb(verb)
        if (pBuilder.hasSemanticContent()) {
            if (this.pendingAdverb) {
                this.placeAdverbIn(pBuilder)
            }
            this.removeFromBuilderList(pBuilder)
            const predicate: Predicate = pBuilder.build()
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

    private getUnfinishedPredBuilder(): PredicateBuilder | undefined {
        const builder: PredicateBuilder | undefined =
            this.unfinishedBuilderList.find(
                builder => builder instanceof PredicateBuilder
            )
        return builder
    }

    private handleDoQuestion(
        clause: Clause,
        pBuilder: PredicateBuilder
    ): void {
        const whWord: Noun | undefined = clause.getNouns().find(
            noun => isWHWord(noun.getName())
        )
        const verb: Verb | undefined = getVerbFromTense(pBuilder)

        if (whWord && verb) {
            pBuilder.setVerb(verb)
            clause.setPredicate(pBuilder.build())
        }
    }

    private handleStrandedBy(bList: WordBuilder[]): void {
        const nounStack: Noun[] = this.nounStack
        getBy(bList, nounStack)
    }

    private handleStrandedPreps(): void {
        const unfinished: WordBuilder[] = this.unfinishedBuilderList
        this.handleStrandedBy(unfinished)

        const pBuilder: PrepBuilder | undefined = this.getUnfinishedPrep()
        if (pBuilder) {
            this.resolvePrep(pBuilder)
        }
    }

    private handleWHRelWord(predWord: Word): void {
        if (!this.pendingNoun) return
        const nounName: string = this.pendingNoun.getName()
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
        const predPhrase: Predicate = predBuilder.build()
        this.predicate = predPhrase
    }

    private makePendingNounSubject(): void {
        if (!this.pendingNoun) {
            return
        }
        if (!this.subject) {
            this.subject = this.pendingNoun
            this.pendingNoun = null
        }
    }

    private placeAdverbIn(builder: WordBuilder): void {
        if (!this.pendingAdverb) {
            throw Error("Tried to set adverb that does not exist.")
        }
        builder.addAdjunct(this.pendingAdverb)
        this.pendingAdverb = null
    }

    private pushAdjunctToClause(phrase: Phrase): void {
        if (!(
            phrase instanceof Adverb ||
            phrase instanceof Preposition
        )) {
            throw Error("Tried to push adjunct that is not an adjunct phrase")
        }
        this.adjunctStack.push(phrase)
    }

    private pushNounToClause(nPhrase: Noun): void {
        if (
            this.unfinishedBuilderList.at(-1) instanceof PrepBuilder
        ) {
            const prepBuilder: PrepBuilder =
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

    private removeFromBuilderList(WordBuilder: WordBuilder) {
        this.unfinishedBuilderList = this.unfinishedBuilderList.filter(
            builder => builder !== WordBuilder
        )
    }

    private resolvePrep(builder: PrepBuilder): void {

        if (this.pendingNoun) {
            // They are at the school that I went [to]
            builder.setObject(this.pendingNoun)
            this.pendingNoun = null

        } else if (this.subject) {
            builder.setObject(this.subject)
        }

        const pPhrase: Preposition = builder.build()
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