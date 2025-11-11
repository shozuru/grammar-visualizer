import { WordBuilder } from "./WordBuilder"
import { Predicate } from "../syntax/Predicate"
import type { Verb } from "../syntax/partsOfSpeech/Verb"
import type { Preposition } from "../syntax/partsOfSpeech/Preposition"
import { Adverb } from "../syntax/partsOfSpeech/Adverb"
import { Noun } from "../syntax/partsOfSpeech/Noun"
import type { Phrase } from "../syntax/partsOfSpeech/Phrase"

export class PredicateBuilder extends WordBuilder {

    private predicate: Predicate | null

    constructor() {
        super()
        this.predicate = null
    }

    public setVerb(verb: Verb): void {
        let pred: Predicate = new Predicate(verb)
        this.predicate = pred
    }

    public getPred(): Predicate | null {
        return this.predicate
    }

    public build(): Predicate {
        if (!(this.predicate instanceof Predicate)) {
            throw Error("Tried to build predicate with no head")
        }
        for (let mod of super.getModStack()) {
            this.predicate.addMod(mod)
        }
        for (let agr of super.getAgrStack()) {
            this.predicate.addAgr(agr)
        }
        return this.predicate
    }

    public hasSemanticContent(): boolean {
        if (!(this.predicate instanceof Predicate)) {
            throw Error("predicate Builder does not have a predicate")
        }
        return this.predicate.getSemanticContent() !== null
    }

    public setSemanticContent(content: Phrase): void {
        if (!(this.predicate instanceof Predicate)) {
            throw Error("predicate Builder does not have a predicate")
        }
        this.predicate.setSemanticElement(content)
    }
}