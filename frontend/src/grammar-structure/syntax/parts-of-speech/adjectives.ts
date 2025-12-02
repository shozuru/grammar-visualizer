import type { Agr } from "../agr";
import type { Mod } from "../mod";
import type { Adverb } from "./adverb";
import type { Phrase } from "./phrase";

export class Adjective implements Phrase {

    private name: string
    private adjunctList: Adverb[]
    private modList: Mod[]
    private agrList: Agr[]

    constructor(name: string) {
        this.name = name
        this.adjunctList = []
        this.modList = []
        this.agrList = []
    }

    public getName(): string {
        return this.name
    }

    public getAdjunctList(): Adverb[] {
        return this.adjunctList
    }

    public addAjunct(adverb: Adverb): void {
        this.adjunctList.push(adverb)
    }

    public getMods(): Mod[] {
        return this.modList
    }

    public addMod(mod: Mod): void {
        this.modList.push(mod)
    }

    public getAgrs(): Agr[] {
        return this.agrList
    }

    public addAgr(agr: Agr): void {
        this.agrList.push(agr)
    }

}