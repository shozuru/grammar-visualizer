import type { Word } from "../types/word"
import type { PartsOfSpeech } from "./syntax-constants"

export class Agr {

    private name: string
    private pos: PartsOfSpeech

    constructor(word: Word) {
        this.name = word.name
        this.pos = word.pos
    }

    public getName(): string {
        return this.name
    }

    public setname(newName: string): void {
        this.name = newName
    }

    public getPos(): PartsOfSpeech {
        return this.pos
    }

    public setPos(pos: PartsOfSpeech): void {
        this.pos = pos
    }
}