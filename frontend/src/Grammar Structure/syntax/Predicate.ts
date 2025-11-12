import { Agr } from "./Agr";
import { Mod } from "./Mod";
import type { Adverb } from "./partsOfSpeech/Adverb";
import type { Phrase } from "./partsOfSpeech/Phrase";
import type { Preposition } from "./partsOfSpeech/Preposition";
import type { Verb } from "./partsOfSpeech/Verb";
import { uncontractVerbalModifiers } from "./SyntaxMethods";

export class Predicate implements Phrase {

    private copula: Verb | null
    private semanticElement: Phrase | null

    private modStack: Mod[]
    private agrStack: Agr[]
    private adjunctStack: (Preposition | Adverb)[]

    constructor(verb: Verb) {
        if (this.isBeVerb(verb)) {
            this.copula = verb
            this.semanticElement = null
        } else {
            this.semanticElement = verb
            this.copula = null
        }
        this.modStack = []
        this.agrStack = []
        this.adjunctStack = []
    }

    public getCopula(): Verb | null {
        return this.copula
    }

    public getSemanticContent(): Phrase | null {
        return this.semanticElement
    }

    public setSemanticElement(element: Phrase): void {
        this.semanticElement = element
    }

    public addMod(tamm: Mod): void {
        if (tamm.getName().includes("'")) {
            let mods: Mod[] = uncontractVerbalModifiers(tamm)
            for (const mod of mods) {
                this.modStack.push(mod)
            }
        } else {
            this.modStack.push(tamm)
        }
    }

    public getModStack(): Mod[] {
        return this.modStack
    }

    public getAgrStack(): Agr[] {
        return this.agrStack
    }

    public addAgr(agr: Agr): void {
        this.agrStack.push(agr)
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

    public addAdjunct(adverb: Adverb | Preposition): void {
        this.adjunctStack.push(adverb)
    }
}