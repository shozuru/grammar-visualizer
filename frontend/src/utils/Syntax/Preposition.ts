import type { Noun } from "./Noun";

export class Preposition {

    private object: Noun | null
    private modifiers: string[]

    constructor() {
        this.object = null
        this.modifiers = []
    }

    public hasObject(): boolean {
        return this.object !== null
    }

    public getObject(): Noun | null {
        return this.object
    }

    public setObject(noun: Noun): void {
        this.object = noun
    }

    public getModifiers(): string[] {
        return this.modifiers
    }

    public addModifier(modifier: string): void {
        this.modifiers.push(modifier)
    }
}