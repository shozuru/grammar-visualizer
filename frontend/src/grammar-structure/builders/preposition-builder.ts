import { Preposition } from "../syntax/parts-of-speech/preposition";
import type { Word } from "../types/word";
import { WordBuilder } from "./word-builder";
import type { Noun } from "../syntax/parts-of-speech/noun";
import { Adverb } from "../syntax/parts-of-speech/adverb";
import { PartsOfSpeech } from "../syntax/syntax-constants";

export class PrepBuilder extends WordBuilder {

    private preposition: Preposition | undefined

    constructor() {
        super()
        this.preposition = undefined
    }

    public setPreposition(prepWord: Word): void {
        const prep = new Preposition(prepWord.name)
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

    public setGenericPrep(name: string): void {
        this.setPreposition(
            {
                pos: PartsOfSpeech.IN,
                name: name
            }
        )
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