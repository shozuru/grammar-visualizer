import type { Adverb } from "./Adverb"
import { Noun } from "./Noun"

export class Preposition {

    private name: string
    private listOfMods: Adverb[]
    private object: Noun | null

    constructor(name: string) {
        this.name = name
        this.listOfMods = []
        this.object = null
    }

    public hasObject(): boolean {
        return this.object instanceof Noun
    }

    public getObject(): Noun | null {
        return this.object
    }

    public setObject(noun: Noun): void {
        this.object = noun
    }

    public getModifiers(): Adverb[] {
        return this.listOfMods
    }

    public addModifier(mod: Adverb): void {
        this.listOfMods.push(mod)
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }
}