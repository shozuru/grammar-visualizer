import type { Noun } from "./Noun"

export class Verb {

    // need to delete this
    private nounList: Noun[]
    private agent: Noun | null
    private experiencer: Noun | null
    private patient: Noun | null
    private modifiers: string[]
    private name: string

    constructor(name: string) {
        this.name = name
        this.agent = null
        this.experiencer = null
        this.patient = null
        this.modifiers = []
        this.nounList = []
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

    public getModifiers(): string[] {
        return this.modifiers
    }

    public addModifier(modifier: string): void {
        this.modifiers.push(modifier)
    }

    public handleAgreement(modifier: string): void {

    }
}