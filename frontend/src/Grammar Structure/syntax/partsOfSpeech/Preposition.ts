import { CanTakeObject } from "./CanTakeObject";
import { Noun } from "./Noun";

export class Preposition extends CanTakeObject {

    private modifiers: string[]
    private name: string

    constructor(name: string) {
        super()
        this.name = name
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

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }
}