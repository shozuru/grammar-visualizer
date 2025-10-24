import { Noun } from "./Noun"
import { Preposition } from "./Preposition"
import { Adverb } from "./Adverb"
import { Verb } from "./Verb"

export class Clause {

    private verb: Verb | null
    private verbModifierList: string[]
    private nounList: Noun[]
    private nounModifierList: string[]
    private adjunctList: (Adverb | Preposition)[]

    private causativeNoun: Noun | null
    private passiveNoun: Noun | null

    constructor() {
        this.verb = null
        this.verbModifierList = []
        this.nounList = []
        this.nounModifierList = []
        this.adjunctList = []

        this.causativeNoun = null
        this.passiveNoun = null
    }

    public getPredicate(): Verb | null {
        return this.verb
    }

    public setPredicate(predicate: Verb): void {
        this.verb = predicate
    }

    public getPredicateModifiers(): string[] {
        return this.verbModifierList
    }

    public addPredicateModifier(modifier: string): void {
        this.verbModifierList.push(modifier)
    }

    public getNouns(): Noun[] {
        return this.nounList
    }

    public addNounToClause(noun: Noun): void {
        this.nounList.push(noun)
    }

    public getAdjuncts(): (Adverb | Preposition)[] {
        return this.adjunctList
    }

    public addAdjunct(adjunct: Adverb | Preposition): void {
        this.adjunctList.push(adjunct)
    }

    public getNounModifiers(): string[] {
        return this.nounModifierList
    }

    public addNounModifier(modifier: string): void {
        this.nounModifierList.push(modifier)
    }

    public getCausativeNoun(): Noun | null {
        return this.causativeNoun
    }

    public setCausativeNoun(noun: Noun): void {
        this.causativeNoun = noun
    }

    public getPassiveNoun(): Noun | null {
        return this.passiveNoun
    }

    public setPassiveNoun(noun: Noun): void {
        this.passiveNoun = noun
    }
}
