import { Agr } from "./Agr";
import { Mod } from "./Mod";
import type { Adverb } from "./partsOfSpeech/Adverb";
import type { Noun } from "./partsOfSpeech/Noun";
import type { Preposition } from "./partsOfSpeech/Preposition";
import type { Verb } from "./partsOfSpeech/Verb";
import { uncontractVerbalModifiers } from "./SyntaxMethods";

export class Predicate {

    private copula: Verb | null
    private semanticElement: Noun | Adverb | Preposition | Verb | null

    private modList: Mod[]
    private agrList: Agr[]

    constructor(verb: Verb) {
        if (this.isBeVerb(verb)) {
            this.copula = verb
            this.semanticElement = null
        } else {
            this.semanticElement = verb
            this.copula = null
        }
        this.modList = []
        this.agrList = []
    }

    public getCopula(): Verb | null {
        return this.copula
    }

    public getSemanticContent(): Verb | Noun | Preposition | Adverb | null {
        return this.semanticElement
    }

    public setSemanticElement(element: Noun | Adverb | Preposition): void {
        this.semanticElement = element
    }

    public addMod(tamm: Mod): void {
        if (tamm.getName().includes("'")) {
            let mods: Mod[] = uncontractVerbalModifiers(tamm)
            for (const mod of mods) {
                this.modList.push(mod)
            }
        } else {
            this.modList.push(tamm)
        }
    }

    public getMods(): Mod[] {
        return this.modList
    }

    public getAgrList(): Agr[] {
        return this.agrList
    }

    public addAgr(agr: Agr): void {
        this.agrList.push(agr)
    }

    private isBeVerb(verb: Verb): boolean {
        let verbName: string = verb.getName()
        return (
            verbName === "am" ||
            verbName === "are" ||
            verbName === "is" ||
            verbName === "was" ||
            verbName === "were" ||
            verbName === "been" ||
            verbName === "be" ||
            verbName === "being"
        )
    }
}