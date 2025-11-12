import { Mod } from "../Mod"
import type { Phrase } from "./Phrase"
import type { Word } from "../../types/Word"
// import type { Relativize } from "../Relativize"
// import type { Case } from "../SyntaxConstants"

export class Noun implements Phrase {

    // private case: Case | null
    private modifiers: Mod[]
    // private relativizer: Relativize | null
    private name: string

    constructor(name: string) {
        this.name = name
        // this.case = null
        this.modifiers = []
        // this.relativizer = null
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
        let causeMod: Mod = new Mod(causeWord)
        this.modifiers.push(causeMod)
    }

    // public getRelativizer(): Relativize | null {
    //     return this.relativizer
    // }

    // public setRelativizer(rel: Relativize): void {
    //     this.relativizer = rel
    // }

}