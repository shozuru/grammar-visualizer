import { Agr } from "./Agr";
import { Mod } from "./Mod";
import type { Adverb } from "./partsOfSpeech/Adverb";
import type { Noun } from "./partsOfSpeech/Noun";
import type { Preposition } from "./partsOfSpeech/Preposition";
import type { Verb } from "./partsOfSpeech/Verb";
import { uncontractVerbalModifiers } from "./SyntaxMethods";

export class Predicate {

    private verb: Verb
    private semanticElement: Noun | Adverb | Preposition | null

    private modList: Mod[]
    private agrList: Agr[]

    constructor(verb: Verb) {
        this.verb = verb
        this.semanticElement = null

        this.modList = []
        this.agrList = []
    }

    public getVerb(): Verb {
        return this.verb
    }

    public setVerb(verb: Verb): void {
        this.verb = verb
    }

    public getSemanticElement(): Noun | Adverb | Preposition | null {
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
}