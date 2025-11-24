import type { Mod } from "../syntax/Mod"
import { Adjective } from "../syntax/partsOfSpeech/Adjectives"
import { Adverb } from "../syntax/partsOfSpeech/Adverb"
import { getLexicalizedMod } from "../syntax/SyntaxMethods"
import type { Word } from "../types/Word"
import { WordBuilder } from "./WordBuilder"

export class AdjectiveBuilder extends WordBuilder {

    private adjective: Adjective | null

    constructor() {
        super()
        this.adjective = null
    }

    public createAndSetAdjective(adjWord: Word): void {
        const adj: Adjective = new Adjective(adjWord.name)
        this.adjective = adj

        const lexMod: Mod | null = getLexicalizedMod(adjWord)
        if (lexMod) {
            super.addMod(lexMod)
        }
    }

    public addAdjunct(adverb: Adverb): void {
        if (!this.adjective) {
            throw Error(
                "tried to add adjunct to adjective phrase without head"
            )
        }
        this.adjective.addAjunct(adverb)
    }

    public build(): Adjective {
        if (!this.adjective) {
            throw Error("Tried to build adjective phrase without head")
        }
        for (const agr of super.getAgrStack()) {
            this.adjective.addAgr(agr)
        }
        for (const mod of super.getModStack()) {
            this.adjective.addMod(mod)
        }
        return this.adjective
    }
}