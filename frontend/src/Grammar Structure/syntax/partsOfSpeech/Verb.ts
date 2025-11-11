export class Verb {

    // need to replace this with actual theta roles.
    // private agent: Noun | null
    // private experiencer: Noun | null
    // private patient: Noun | null
    private name: string
    // private modList: Mod[]
    // private agrList: Agr[]

    constructor(name: string) {
        this.name = name
        // this.agent = null
        // this.experiencer = null
        // this.patient = null
        // this.modList = []
        // this.agrList = []
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

    // public addMod(tamm: Mod): void {
    //     if (tamm.getName().includes("'")) {
    //         let mods: Mod[] = uncontractVerbalModifiers(tamm)
    //         for (const mod of mods) {
    //             this.modList.push(mod)
    //         }
    //     } else {
    //         this.modList.push(tamm)
    //     }
    // }

    // public getMods(): Mod[] {
    //     return this.modList
    // }

    // public getAgrList(): Agr[] {
    //     return this.agrList
    // }

    // public addAgr(agr: Agr): void {
    //     this.agrList.push(agr)
    // }
}