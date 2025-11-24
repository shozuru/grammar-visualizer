import { Noun } from "../syntax/partsOfSpeech/Noun"
import type { Word } from "../types/Word"
import { WordBuilder } from "./WordBuilder"

export class NounBuilder extends WordBuilder {

    private noun: Noun | null

    constructor() {
        super()
        this.noun = null
    }

    public createAndSetNoun(word: Word): void {
        const noun: Noun = new Noun(word.name)
        this.noun = noun
    }

    public getNoun(): Noun | null {
        return this.noun
    }

    public build(): Noun {
        if (!this.noun) {
            throw Error("Tried to build noun that doesn't have a head")
        }
        for (const mod of super.getModStack()) {
            this.noun.addModifier(mod)
        }
        return this.noun
    }
}