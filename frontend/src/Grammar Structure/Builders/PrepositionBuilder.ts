import { Preposition } from "../syntax/partsOfSpeech/Preposition";
import type { Word } from "../types/Word";
import { WordBuilder } from "./WordBuilder";
import type { Noun } from "../syntax/partsOfSpeech/Noun";
import { Adverb } from "../syntax/partsOfSpeech/Adverb";

export class PrepBuilder extends WordBuilder {

    private preposition: Preposition | null

    constructor() {
        super()
        this.preposition = null
    }

    public setPreposition(prepWord: Word): void {
        const prep: Preposition = new Preposition(prepWord.name)
        this.preposition = prep
    }

    public setObject(noun: Noun): void {
        if (!this.preposition) {
            throw Error(
                "Tried to add object to preposition head " +
                "that has not been set yet"
            )
        }
        this.preposition.setObject(noun)
    }

    public addAdjunct(adverb: Adverb): void {
        if (!this.preposition) {
            throw Error(
                "Tried to add adjunct to preposition head " +
                "that has not been set yet"
            )
        }
        this.preposition.addAdjunct(adverb)
    }

    public build(): Preposition {
        if (!this.preposition) {
            throw Error(
                "tried to build preposition phrase without preposition"
            )
        }
        for (const adjunct of super.getAdjunctStack()) {
            this.preposition.addAdjunct(adjunct)
        }
        return this.preposition
    }
}