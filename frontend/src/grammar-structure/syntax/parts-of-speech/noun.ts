import { Mod } from "../mod"
import type { Phrase } from "./phrase"
import type { Word } from "../../types/word"
// import type { Case } from "../SyntaxConstants"

export class Noun implements Phrase {

    // private case: Case | null
    private modifiers: Mod[]
    private relativizer: Noun | null
    private name: string

    constructor(name: string) {
        this.name = name
        // this.case = null
        this.modifiers = []
        this.relativizer = null
    }

    public getName(): string {
        return this.name
    }

    // public hasCase(): boolean {
    //     return this.case !== null
    // }

    // public getCase(): Case | null {
    //     return this.case
    // }

    // public setCase(c: Case): void {
    //     this.case = c
    // }

    public getModifiers(): Mod[] {
        return this.modifiers
    }

    public addModifier(mod: Mod): void {
        this.modifiers.push(mod)
    }

    public addCausative(causeWord: Word): void {
        const causeMod = new Mod(causeWord)
        this.modifiers.push(causeMod)
    }

    public connectAndReturnRelNoun(): Noun {
        const relative = new Noun('REL')
        this.relativizer = relative
        return relative
    }

    public getRelativizer(): Noun | null {
        return this.relativizer
    }
}