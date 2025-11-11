import type { Agr } from "../Agr"
import type { Mod } from "../Mod"
import type { Phrase } from "./Phrase"

export class Adverb implements Phrase {

    private name: string
    private listOfMods: (Adverb | Mod)[]
    private listOfAgrs: Agr[]
    // private isPredicate: boolean

    constructor(name: string) {
        this.name = name
        this.listOfMods = []
        this.listOfAgrs = []
    }

    public getName(): string {
        return this.name
    }

    public getMods(): (Adverb | Mod)[] {
        return this.listOfMods
    }

    public addMod(modifier: Adverb | Mod): void {
        this.listOfMods.push(modifier)
    }

    public getAgrs(): Agr[] {
        return this.listOfAgrs
    }

    public addAgr(agr: Agr): void {
        this.listOfAgrs.push(agr)
    }
}