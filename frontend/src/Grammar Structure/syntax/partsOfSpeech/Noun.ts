import type { Mod } from "../Mod"
import type { Relativize } from "../Relativize"
import type { Case } from "../SyntaxConstants"

export class Noun {

    private case: Case | null
    private modifiers: Mod[]
    private name: string
    private relativizer: Relativize | null

    constructor(name: string) {
        this.name = name
        this.case = null
        this.modifiers = []
        this.relativizer = null
    }

    public setName(newName: string) {
        this.name = newName
    }

    public getName(): string {
        return this.name
    }

    public hasCase(): boolean {
        return this.case !== null
    }

    public getCase(): Case | null {
        return this.case
    }

    public setCase(c: Case): void {
        this.case = c
    }

    public getModifiers(): Mod[] {
        return this.modifiers
    }

    public addModifier(mod: Mod): void {
        this.modifiers.push(mod)
    }

    public getRelativizer(): Relativize | null {
        return this.relativizer
    }

    public setRelativizer(rel: Relativize): void {
        this.relativizer = rel
    }
}