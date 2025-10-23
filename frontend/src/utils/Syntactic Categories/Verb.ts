import type { Adverb } from "./Adverb"
import { CanTakeObject } from "./CanTakeObject"
import type { Noun } from "./Noun"
import type { Preposition } from "./Preposition"

export class Verb extends CanTakeObject {

    // need to replace this with actual theta roles.
    private nounList: Noun[]

    private agent: Noun | null
    private experiencer: Noun | null
    private patient: Noun | null
    private adverbs: (Adverb | Preposition)[]
    private name: string
    private tamm: string[]

    constructor(name: string) {
        super()
        this.name = name
        this.agent = null
        this.experiencer = null
        this.patient = null
        this.adverbs = []
        this.nounList = []
        this.tamm = []
    }

    public addNoun(n: Noun): void {
        this.nounList.push(n)
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }

    public hasAgent(): boolean {
        return this.agent !== null
    }

    public hasExperiencer(): boolean {
        return this.experiencer !== null
    }

    public hasPatient(): boolean {
        return this.patient !== null
    }

    public getAgent(): Noun | null {
        return this.agent
    }

    public getExperiencer(): Noun | null {
        return this.experiencer
    }

    public getPatient(): Noun | null {
        return this.patient
    }

    public setAgent(a: Noun): void {
        this.agent = a
    }

    public setExperiencer(e: Noun): void {
        this.experiencer = e
    }

    public setPatient(p: Noun): void {
        this.patient = p
    }

    public getAdjunct(): (Adverb | Preposition)[] {
        return this.adverbs
    }

    public addAdjunct(modifier: Adverb | Preposition): void {
        this.adverbs.push(modifier)
    }

    public handleAgreement(modifier: string): void {
    }
}