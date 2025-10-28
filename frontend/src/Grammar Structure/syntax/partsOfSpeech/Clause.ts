import { Noun } from "./Noun"
import { Preposition } from "./Preposition"
import { Adverb } from "./Adverb"
import type { Agr } from "../Agr"
import type { Mod } from "../Mod"
import { Predicate } from "../Predicate"
import type { Relativize } from "../Relativize"

export class Clause {
    private predicate: Predicate
    private nounList: (Noun | Relativize)[]
    private adjunctList: (Adverb | Preposition)[]

    private causativeNoun: Noun | null

    constructor(predicate: Predicate) {
        this.predicate = predicate
        this.nounList = []
        this.adjunctList = []

        this.causativeNoun = null
    }

    public getPredicate(): Predicate {
        return this.predicate
    }

    public getPredMods(): Mod[] {
        if (this.predicate) {
            return this.predicate.getMods()
        }
        return []
    }

    public addPredMod(modifier: Mod): void {
        if (this.predicate) {
            this.predicate.addMod(modifier)
        }
    }

    /**
     * gets list of Agr objects that are agreement markers of this clause's 
     * predicate if there is a main predicate
     * @returns list of Agrs
     */
    public getPredAgrs(): Agr[] {
        if (this.predicate) {
            return this.predicate.getAgrList()
        }
        return []
    }

    public addPredAgr(agr: Agr): void {
        if (this.predicate) {
            this.predicate.addAgr(agr)
        }
    }

    public getNouns(): (Noun | Relativize)[] {
        return this.nounList
    }

    public addNounToClause(noun: Noun | Relativize): void {
        this.nounList.push(noun)
    }

    public getAdjuncts(): (Adverb | Preposition)[] {
        return this.adjunctList
    }

    public addAdjunct(adjunct: Adverb | Preposition): void {
        this.adjunctList.push(adjunct)
    }

    public getNounModifiers(noun: Noun): Mod[] {
        return noun.getModifiers()
    }

    public addNounModifier(noun: Noun, mod: Mod): void {
        noun.addModifier(mod)
    }

    public getCausativeNoun(): Noun | null {
        return this.causativeNoun
    }

    public setCausativeNoun(noun: Noun): void {
        this.causativeNoun = noun
    }
}
