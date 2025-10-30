import type { Pair } from "../types/Word"
import type { PartsOfSpeech } from "./SyntaxConstants"

export class Mod {

    private name: string
    private pos: PartsOfSpeech

    constructor(word: Pair) {
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