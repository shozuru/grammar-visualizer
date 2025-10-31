import type { Adverb } from "./Adverb";
import { CanTakeObject } from "./CanTakeObject";
import { Noun } from "./Noun";

export class Preposition extends CanTakeObject {

    private listOfModifiers: Adverb[]
    private name: string

    constructor(name: string) {
        super()
        this.name = name
        this.listOfModifiers = []
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
        return this.listOfModifiers
    }

    public addModifier(modifier: Adverb): void {
        this.listOfModifiers.push(modifier)
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }
}