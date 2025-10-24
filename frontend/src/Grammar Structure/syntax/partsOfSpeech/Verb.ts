import { uncontractVerbalModifiers } from "../SyntaxMethods"
import { CanTakeObject } from "./CanTakeObject"
export class Verb extends CanTakeObject {

    // need to replace this with actual theta roles.
    // private agent: Noun | null
    // private experiencer: Noun | null
    // private patient: Noun | null
    private name: string
    private tammList: string[]

    constructor(name: string) {
        super()
        this.name = name
        // this.agent = null
        // this.experiencer = null
        // this.patient = null
        this.tammList = []
    }

    public getName(): string {
        return this.name
    }

    public setName(newName: string): void {
        this.name = newName
    }

    // public hasAgent(): boolean {
    //     return this.agent !== null
    // }

    // public hasExperiencer(): boolean {
    //     return this.experiencer !== null
    // }

    // public hasPatient(): boolean {
    //     return this.patient !== null
    // }

    // public getAgent(): Noun | null {
    //     return this.agent
    // }

    // public getExperiencer(): Noun | null {
    //     return this.experiencer
    // }

    // public getPatient(): Noun | null {
    //     return this.patient
    // }

    // public setAgent(a: Noun): void {
    //     this.agent = a
    // }

    // public setExperiencer(e: Noun): void {
    //     this.experiencer = e
    // }

    // public setPatient(p: Noun): void {
    //     this.patient = p
    // }

    public addTamm(gramMod: string): void {
        if (gramMod.includes("'")) {
            let mods: string[] = uncontractVerbalModifiers(gramMod)
            for (const mod of mods) {
                this.tammList.push(mod)
            }
        } else {
            this.tammList.push(gramMod)
        }
    }

    public getTammList(): string[] {
        return this.tammList
    }

    public handleAgreement(modifier: string): void {
    }
}