import { WordBuilder } from "./word-builder"
import { Predicate } from "../syntax/predicate"
import type { Verb } from "../syntax/parts-of-speech/verb"
import type { Phrase } from "../syntax/parts-of-speech/phrase"

export class PredicateBuilder extends WordBuilder {

    private predicate: Predicate | undefined

    constructor() {
        super()
        this.predicate = undefined
    }

    public setVerb(verb: Verb): void {
        const pred = new Predicate(verb)
        this.predicate = pred
    }

    public getPred(): Predicate | undefined {
        return this.predicate
    }

    public build(): Predicate {
        if (!this.predicate) {
            throw Error("Tried to build predicate with no head")
        }
        for (const mod of super.getModStack()) {
            this.predicate.addMod(mod)
        }
        for (const agr of super.getAgrStack()) {
            this.predicate.addAgr(agr)
        }
        for (const adjunct of super.getAdjunctStack()) {
            this.predicate.addAdjunctPhrase(adjunct)
        }
        return this.predicate
    }

    public hasSemanticContent(): boolean {
        if (!this.predicate) {
            throw Error("predicate Builder does not have a predicate")
        }
        return this.predicate.getSemanticContent() !== undefined
    }

    public setSemanticContent(content: Phrase): void {
        if (!this.predicate) {
            throw Error("predicate Builder does not have a predicate")
        }
        this.predicate.setSemanticElement(content)
    }

    public hasCopula(): boolean {
        if (!this.predicate) {
            return false
        }
        return (this.predicate.getCopula() !== undefined)
    }
}