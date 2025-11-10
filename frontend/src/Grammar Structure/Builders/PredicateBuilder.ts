import { WordBuilder } from "./WordBuilder"
import { Predicate } from "../syntax/Predicate"
import type { Verb } from "../syntax/partsOfSpeech/Verb"

export class PredicateBuilder extends WordBuilder {

    private predicate: Predicate | null

    constructor() {
        super()
        this.predicate = null
    }

    public setPredicate(verb: Verb): void {
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
}