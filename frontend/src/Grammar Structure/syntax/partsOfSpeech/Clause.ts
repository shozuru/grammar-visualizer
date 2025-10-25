import { Noun } from "./Noun"
import { Preposition } from "./Preposition"
import { Adverb } from "./Adverb"
import { Verb } from "./Verb"
import type { Pair } from "../../types/Pair"
import { PartsOfSpeech } from "../SyntaxConstants"

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

    public getPredicateModifiers(): null | string[] {
        if (this.verb) {
            return this.verb.getTammList()
        }
        return null
    }

    public addPredicateModifier(modifier: Pair): void {
        if (this.verb) {
            if (modifier.pos === PartsOfSpeech.VBAGR) {
                this.verb.addAgr(modifier.name)
            } else {
                this.verb.addTamm(modifier.name)
            }
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
