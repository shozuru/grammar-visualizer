import type { Adverb } from "./adverb"
import { Noun } from "./noun"
import type { Phrase } from "./phrase"

export class Preposition implements Phrase {

    private adjunctList: Adverb[]
    private object: Noun | null
    private name: string

    constructor(name: string) {
        this.name = name
        this.adjunctList = []
        this.object = null
    }

    public getName(): string {
        return this.name
    }

    public hasObject(): boolean {
        return this.object instanceof Noun
    }

    public getObject(): Noun | null {
        return this.object
    }

    public setObject(noun: Noun): void {
        this.object = noun
    }

    public getAdjuncts(): Adverb[] {
        return this.adjunctList
    }

    public addAdjunct(mod: Adverb): void {
        this.adjunctList.push(mod)
    }
}