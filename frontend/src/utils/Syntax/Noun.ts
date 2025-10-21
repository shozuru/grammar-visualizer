import type { Case } from "../SyntaxConstants"

export class Noun {

    private case: Case | null
    private modifiers: string[]

    constructor() {
        this.case = null
        this.modifiers = []
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

    public getModifiers(): string[] {
        return this.modifiers
    }

    public addModifier(modifier: string): void {
        this.modifiers.push(modifier)
    }
}