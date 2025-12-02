import { Agr } from "./agr";
import { Mod } from "./mod";
import type { Adverb } from "./parts-of-speech/adverb";
import type { Phrase } from "./parts-of-speech/phrase";
import type { Preposition } from "./parts-of-speech/preposition";
import type { Verb } from "./parts-of-speech/verb";
import { uncontractVerbalModifiers } from "./syntax-methods";

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
            const mods: Mod[] = uncontractVerbalModifiers(tamm)
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
        const verbName: string = verb.getName()
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

    public getAdjunctStack(): (Adverb | Preposition)[] {
        return this.adjunctStack
    }
}