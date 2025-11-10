import { Preposition } from "../syntax/partsOfSpeech/Preposition";
import type { Word } from "../types/Word";
import { WordBuilder } from "./WordBuilder";
import type { Noun } from "../syntax/partsOfSpeech/Noun";

export class PrepBuilder extends WordBuilder {

    private preposition: Preposition | null

    constructor() {
        super()
        this.preposition = null
    }

    public setPreposition(prepWord: Word): void {
        let prep: Preposition = new Preposition(prepWord.name)
        this.preposition = prep
    }

    public setObject(noun: Noun): void {
        if (!(this.preposition instanceof Preposition)) {
            throw Error(
                "Tried to add object to preposition head " +
                "that has not been set yet"
            )
        }
        this.preposition.setObject(noun)
    }

    public build(): Preposition {
        if (!(this.preposition instanceof Preposition)) {
            throw Error(
                "tried to build preposition phrase without preposition"
            )
        }
        // for (let mod of super.getModStack()) {
        //     this.preposition.addModifier(mod)
        // }
        return this.preposition
    }
}