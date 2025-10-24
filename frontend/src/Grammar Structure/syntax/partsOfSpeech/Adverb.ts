export class Adverb {

    private name: string
    private listOfModifiers: Adverb[]
    // private isPredicate: boolean

    constructor(name: string) {
        this.name = name
        this.listOfModifiers = []
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }

    public getModifiers(): Adverb[] {
        return this.listOfModifiers
    }

    public addModifier(modifier: Adverb): void {
        this.listOfModifiers.push(modifier)
    }
}