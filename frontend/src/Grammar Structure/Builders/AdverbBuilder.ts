import { Adverb } from "../syntax/partsOfSpeech/Adverb";
import { WordBuilder } from "./WordBuilder";
import type { Word } from "../types/Word";
import { getLexicalizedMod } from "../syntax/SyntaxMethods";
import type { Mod } from "../syntax/Mod";

export class AdverbBuilder extends WordBuilder {

    private adverb: Adverb | null

    constructor() {
        super()
        this.adverb = null
    }

    public createAndSetAdverb(adverbWord: Word): void {
        let adverb: Adverb = new Adverb(adverbWord.name)
        this.adverb = adverb
    }

    public build(): Adverb {
        if (!(this.adverb instanceof Adverb)) {
            throw Error("Tried to build adverb phrase without head")
        }
        for (let agr of super.getAgrStack()) {
            this.adverb.addAgr(agr)
        }
        for (let mod of super.getModStack()) {
            this.adverb.addMod(mod)
        }
        return this.adverb
    }

    // public addAdjunct(adverb: Adverb): void {
    //     if (!(this.adverb instanceof Adverb)) {
    //         throw Error(
    //             "Tried to add adjunct to Adverb head " +
    //             "that has not been set yet"
    //         )
    //     }
    //     this.adverb.addAdjunct(adverb)
    // }
}