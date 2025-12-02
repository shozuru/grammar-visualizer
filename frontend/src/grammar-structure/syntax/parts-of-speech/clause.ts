import { Noun } from "./noun"
import { Predicate } from "../predicate"

export class Clause {
    private predicate: Predicate | null
    private nounList: Noun[]


    // maybe this should wait until semantics are dealt with since it introduces
    // an Effector 
    // private causativeNoun: Noun | null

    constructor() {
        this.predicate = null
        this.nounList = []

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

    public getNouns(): Noun[] {
        return this.nounList
    }

    public getPredicate(): Predicate {
        if (!this.predicate) {
            throw Error("No predicate has been set")
        }
        return this.predicate
    }
}
