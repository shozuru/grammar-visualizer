import { Noun } from "./Noun"
import { Preposition } from "./Preposition"
import { Adverb } from "./Adverb"
import { Verb } from "./Verb"
import type { Agr } from "../Agr"
import type { Mod } from "../Mod"

export class Clause {

    private verb: Verb | null
    private nounList: Noun[]
    private adjunctList: (Adverb | Preposition)[]

    private causativeNoun: Noun | null

    constructor() {
        this.verb = null
        this.nounList = []
        this.adjunctList = []

        this.causativeNoun = null
    }

    public getPredicate(): Verb | null {
        return this.verb
    }

    public setPredicate(predicate: Verb): void {
        this.verb = predicate
    }

    public getPredMods(): Mod[] {
        if (this.verb) {
            return this.verb.getMods()
        }
        return []
    }

    public addPredMod(modifier: Mod): void {
        if (this.verb) {
            this.verb.addMod(modifier)
        }
    }

    /**
     * gets list of Agr objects that are agreement markers of this clause's 
     * predicate if there is a main predicate
     * @returns list of Agrs
     */
    public getPredAgrs(): Agr[] {
        if (this.verb) {
            return this.verb.getAgrList()
        }
        return []
    }

    public addPredAgr(agr: Agr): void {
        if (this.verb) {
            this.verb.addAgr(agr)
        }
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

    public getNounModifiers(noun: Noun): string[] {
        return noun.getModifiers()
    }

    public addNounModifier(noun: Noun, modifier: string): void {
        noun.addModifier(modifier)
    }

    public getCausativeNoun(): Noun | null {
        return this.causativeNoun
    }

    public setCausativeNoun(noun: Noun): void {
        this.causativeNoun = noun
    }
}
