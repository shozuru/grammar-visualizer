import { Noun } from "./Noun"
import { Preposition } from "./Preposition"
import { Adverb } from "./Adverb"
import { Predicate } from "../Predicate"

export class Clause {
    private predicate: Predicate | null
    private nounList: Noun[]
    private adjunctList: (Adverb | Preposition)[]


    // maybe this should wait until semantics are dealt with since it introduces
    // an Effector 
    // private causativeNoun: Noun | null

    constructor() {
        this.predicate = null
        this.nounList = []
        this.adjunctList = []

        // this.causativeNoun = null
    }

    public addNoun(noun: Noun): void {
        this.nounList.push(noun)
    }

    public setPredicate(pred: Predicate): void {
        if (this.predicate) {
            throw Error("predicate has already been set")
        }
        this.predicate = pred
    }

    public addAdjunct(adjunct: Preposition | Adverb) {
        this.adjunctList.push(adjunct)
    }
}
