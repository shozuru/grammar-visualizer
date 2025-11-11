import { Adjective } from "../syntax/partsOfSpeech/Adjectives"
import type { Word } from "../types/Word"
import { WordBuilder } from "./WordBuilder"

export class AdjectiveBuilder extends WordBuilder {

    private adjective: Adjective | null

    constructor() {
        super()
        this.adjective = null
    }

    public createAndSetAdjective(adjWord: Word): void {
        let adj: Adjective = new Adjective(adjWord.name)
        this.adjective = adj
    }

    public build(): Adjective {
        if (!(this.adjective instanceof Adjective)) {
            throw Error("Tried to build adjective phrase without head")
        }
        for (let agr of super.getAgrStack()) {
            this.adjective.addAgr(agr)
        }
        for (let mod of super.getModStack()) {
            this.adjective.addMod(mod)
        }
        return this.adjective
    }
}