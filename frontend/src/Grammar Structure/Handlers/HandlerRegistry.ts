import { PartsOfSpeech } from "../syntax/SyntaxConstants"
import type { WordHandler } from "./WordHandlers/WordHandler"
import type { Word } from "../types/Word"
import { NounHandler } from "./WordHandlers/NounHandler"
import { VerbHandler } from "./WordHandlers/VerbHandler"
import { AdverbHandler } from "./WordHandlers/AdverbHandler"
import { PrepositionHandler } from "./WordHandlers/PrepositionHandler"
import { AdjectiveHandler } from "./WordHandlers/AdjectiveHandler"
import { CausativeHandler } from "./WordHandlers/CausativeHandler"

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
        let nounTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.NN, PartsOfSpeech.NNP, PartsOfSpeech.NNS,
                PartsOfSpeech.NNPS, PartsOfSpeech.PRP, PartsOfSpeech.FW,
                PartsOfSpeech.DT, PartsOfSpeech.PASSIVE, PartsOfSpeech.PRPQ
            ]
        let verbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.VB, PartsOfSpeech.VBD, PartsOfSpeech.VBZ,
                PartsOfSpeech.VBP, PartsOfSpeech.VBN, PartsOfSpeech.PsvAgr,
                PartsOfSpeech.InfAgr, PartsOfSpeech.TO, PartsOfSpeech.TENSE,
                PartsOfSpeech.PERFECTIVE, PartsOfSpeech.NEGATION,
                PartsOfSpeech.MD
            ]
        let adverbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.RB, PartsOfSpeech.RBR, PartsOfSpeech.RBS
            ]
        let adjTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.JJ, PartsOfSpeech.JJR, PartsOfSpeech.JJS,
                PartsOfSpeech.AdvAgr, PartsOfSpeech.SUPERLATIVE,
                PartsOfSpeech.COMPARATIVE
            ]
        let prepTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.IN
            ]
        let causTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.CAUSATIVE
            ]

        for (let tag of nounTags) {
            this.register(tag, new NounHandler())
        }
        for (let tag of verbTags) {
            this.register(tag, new VerbHandler())
        }
        for (let tag of adverbTags) {
            this.register(tag, new AdverbHandler())
        }
        for (let tag of adjTags) {
            this.register(tag, new AdjectiveHandler())
        }
        for (let tag of prepTags) {
            this.register(tag, new PrepositionHandler())
        }
        for (let tag of causTags) {
            this.register(tag, new CausativeHandler())
        }
    }

    public getHandler(word: Word): WordHandler {
        let handler = this.registry.get(word.pos)
        if (!handler) {
            throw Error(`This word, '${word}' does not have a handler`)
        }
        return handler
    }
}