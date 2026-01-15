import { Adverb } from "../syntax/parts-of-speech/adverb";
import { WordBuilder } from "./word-builder";
import type { Word } from "../types/word";

export class AdverbBuilder extends WordBuilder {

    private adverb: Adverb | undefined

    constructor() {
        super()
        this.adverb = undefined
    }

    public createAndSetAdverb(adverbWord: Word): void {
        const adverb = new Adverb(adverbWord.name)
        this.adverb = adverb
    }

    public build(): Adverb {
        if (!this.adverb) {
            throw Error("Tried to build adverb phrase without head")
        }
        for (const agr of super.getAgrStack()) {
            this.adverb.addAgr(agr)
        }
        for (const mod of super.getModStack()) {
            this.adverb.addMod(mod)
        }
        for (const adjunct of super.getAdjunctStack()) {
            this.adverb.addAdjunct(adjunct)
        }
        return this.adverb
    }

    public addAdjunct(adverb: Adverb): void {
        if (!this.adverb) {
            throw Error(
                "Tried to add adjunct to Adverb head " +
                "that has not been set yet"
            )
        }
        this.adverb.addAdjunct(adverb)
    }
}