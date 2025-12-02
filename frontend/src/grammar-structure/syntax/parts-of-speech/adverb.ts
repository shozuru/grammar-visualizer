import type { Agr } from "../agr"
import type { Mod } from "../mod"
import type { Phrase } from "./phrase"

export class Adverb implements Phrase {

    private name: string
    private listOfMods: Mod[]
    private listOfAgrs: Agr[]
    private adjunctList: Adverb[]

    constructor(name: string) {
        this.name = name
        this.listOfMods = []
        this.listOfAgrs = []
        this.adjunctList = []
    }

    public getName(): string {
        return this.name
    }

    public getMods(): Mod[] {
        return this.listOfMods
    }

    public addMod(modifier: Mod): void {
        this.listOfMods.push(modifier)
    }

    public getAgrs(): Agr[] {
        return this.listOfAgrs
    }

    public addAgr(agr: Agr): void {
        this.listOfAgrs.push(agr)
    }

    public addAdjunct(adverb: Adverb): void {
        this.adjunctList.push(adverb)
    }

    public getAdjuncts(): Adverb[] {
        return this.adjunctList
    }
}