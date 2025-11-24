import { Adverb } from "../syntax/partsOfSpeech/Adverb";
import { WordBuilder } from "./WordBuilder";
import type { Word } from "../types/Word";

export class AdverbBuilder extends WordBuilder {

    private adverb: Adverb | null

    constructor() {
        super()
        this.adverb = null
    }

    public createAndSetAdverb(adverbWord: Word): void {
        const adverb: Adverb = new Adverb(adverbWord.name)
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