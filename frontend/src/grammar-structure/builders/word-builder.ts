import { Mod } from "../syntax/mod";
import type { Word } from "../types/word";
import { Agr } from "../syntax/agr";
import type { Phrase } from "../syntax/parts-of-speech/phrase";
import type { Adverb } from "../syntax/parts-of-speech/adverb";

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

    public removeMod(modToRemove: Mod): void {
        if (!this.modStack.includes(modToRemove)) {
            throw Error("mod to remove not in modStack")
        }
        this.modStack = this.modStack.filter(
            mod => mod !== modToRemove
        )
    }

    public createAndAddAgr(word: Word): void {
        const agr: Agr = new Agr(word)
        this.agrStack.push(agr)
    }

    public addAgr(agr: Agr): void {
        this.agrStack.push(agr)
    }

    public removeAgr(agrToRemove: Agr): void {
        if (!this.agrStack.includes(agrToRemove)) {
            throw Error("agr to remove not in agrStack")
        }
        this.agrStack = this.agrStack.filter(
            agr => agr !== agrToRemove
        )
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