export class Adverb {

    private name: string
    // private isPredicate: boolean

    constructor(name: string) {
        this.name = name
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }
}