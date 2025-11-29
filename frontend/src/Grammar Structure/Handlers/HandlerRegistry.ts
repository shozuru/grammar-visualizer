import { PartsOfSpeech } from "../syntax/SyntaxConstants"
import type { WordHandler } from "./WordHandlers/WordHandler"
import type { Word } from "../types/Word"
import { NounHandler } from "./WordHandlers/NounHandler"
import { VerbHandler } from "./WordHandlers/VerbHandler"
import { AdverbHandler } from "./WordHandlers/AdverbHandler"
import { PrepositionHandler } from "./WordHandlers/PrepositionHandler"
import { AdjectiveHandler } from "./WordHandlers/AdjectiveHandler"
import { CausativeHandler } from "./WordHandlers/CausativeHandler"
import { RelativeHandler } from "./WordHandlers/RelativeHandler"

export class HandlerRegistry {

    private registry: Map<PartsOfSpeech, WordHandler>

    constructor() {
        this.registry = new Map<PartsOfSpeech, WordHandler>()
        this.setUpHandlers()
    }

    private register(pos: PartsOfSpeech, handler: WordHandler): void {
        this.registry.set(pos, handler)
    }

    private setUpHandlers(): void {
        const nounTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.NN, PartsOfSpeech.NNP, PartsOfSpeech.NNS,
                PartsOfSpeech.NNPS, PartsOfSpeech.PRP, PartsOfSpeech.FW,
                PartsOfSpeech.DT, PartsOfSpeech.PASSIVE, PartsOfSpeech.PRPQ
            ]
        const verbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.VB, PartsOfSpeech.VBD, PartsOfSpeech.VBZ,
                PartsOfSpeech.VBP, PartsOfSpeech.VBN, PartsOfSpeech.PsvAgr,
                PartsOfSpeech.InfAgr, PartsOfSpeech.TO, PartsOfSpeech.TENSE,
                PartsOfSpeech.PERFECTIVE, PartsOfSpeech.NEGATION,
                PartsOfSpeech.MD
            ]
        const adverbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.RB, PartsOfSpeech.RBR, PartsOfSpeech.RBS
            ]
        const adjTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.JJ, PartsOfSpeech.JJR, PartsOfSpeech.JJS,
                PartsOfSpeech.AdvAgr, PartsOfSpeech.SUPERLATIVE,
                PartsOfSpeech.COMPARATIVE
            ]
        const prepTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.IN
            ]
        const causTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.CAUSATIVE
            ]
        const relTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.WDT,
                PartsOfSpeech.WR,
                PartsOfSpeech.WP,
                PartsOfSpeech.WPQ
            ]

        for (const tag of nounTags) {
            this.register(tag, new NounHandler())
        }
        for (const tag of verbTags) {
            this.register(tag, new VerbHandler())
        }
        for (const tag of adverbTags) {
            this.register(tag, new AdverbHandler())
        }
        for (const tag of adjTags) {
            this.register(tag, new AdjectiveHandler())
        }
        for (const tag of prepTags) {
            this.register(tag, new PrepositionHandler())
        }
        for (const tag of causTags) {
            this.register(tag, new CausativeHandler())
        }
        for (const tag of relTags) {
            this.register(tag, new RelativeHandler())
        }
    }

    public getHandler(word: Word): WordHandler {
        const handler = this.registry.get(word.pos)
        if (!handler) {
            throw Error(`This word, '${word.name}' does not have a handler`)
        }
        return handler
    }
}