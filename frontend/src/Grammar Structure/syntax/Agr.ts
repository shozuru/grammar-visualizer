import type { Word } from "../types/Word"
import type { PartsOfSpeech } from "./SyntaxConstants"

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