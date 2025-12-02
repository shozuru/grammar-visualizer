import type { Word } from "../types/word"
import type { PartsOfSpeech } from "./syntax-constants"

export class Mod {

    private name: string
    private pos: PartsOfSpeech

    constructor(word: Word) {
        this.name = word.name
        this.pos = word.pos
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }

    public getPos(): PartsOfSpeech {
        return this.pos
    }

    public setPos(pos: PartsOfSpeech): void {
        this.pos = pos
    }
}