import { Mod } from "../syntax/Mod";
import type { Word } from "../types/Word";
import { Agr } from "../syntax/Agr";
import type { Phrase } from "../syntax/partsOfSpeech/Phrase";

export abstract class WordBuilder {

    private modStack: Mod[]
    private agrStack: Agr[]

    constructor() {
        this.modStack = []
        this.agrStack = []
    }

    abstract build(): Phrase

    public createAndAddMod(word: Word): void {
        let mod: Mod = new Mod(word)
        this.modStack.push(mod)
    }

    public addMod(mod: Mod): void {
        this.modStack.push(mod)
    }

    public createAndAddAgr(word: Word): void {
        let agr: Agr = new Agr(word)
        this.agrStack.push(agr)
    }

    public addAgr(agr: Agr): void {
        this.agrStack.push(agr)
    }

    public getAgrStack(): Agr[] {
        return this.agrStack
    }

    public getModStack(): Mod[] {
        return this.modStack
    }
}