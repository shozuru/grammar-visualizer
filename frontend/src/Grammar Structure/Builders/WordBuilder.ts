import { Mod } from "../syntax/Mod";
import type { Word } from "../types/Word";
import { Agr } from "../syntax/Agr";
import type { Phrase } from "../syntax/partsOfSpeech/Phrase";
import type { Adverb } from "../syntax/partsOfSpeech/Adverb";

export abstract class WordBuilder {

    private modStack: Mod[]
    private agrStack: Agr[]
    private adjunctStack: Adverb[]

    constructor() {
        this.modStack = []
        this.agrStack = []
        this.adjunctStack = []
    }

    abstract build(): Phrase

    public createAndAddMod(word: Word): void {
        const mod: Mod = new Mod(word)
        this.modStack.push(mod)
    }

    public addMod(mod: Mod): void {
        this.modStack.push(mod)
    }

    public createAndAddAgr(word: Word): void {
        const agr: Agr = new Agr(word)
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

    public addAdjunct(adverb: Adverb): void {
        this.adjunctStack.push(adverb)
    }

    public getAdjunctStack(): Adverb[] {
        return this.adjunctStack
    }
}