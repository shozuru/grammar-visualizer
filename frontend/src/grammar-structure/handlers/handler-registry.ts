import { PartsOfSpeech } from "../syntax/syntax-constants"
import type { WordHandler } from "./word-handlers/word-handler"
import type { Word } from "../types/word"
import { NounHandler } from "./word-handlers/noun-handler"
import { VerbHandler } from "./word-handlers/verb-handler"
import { AdverbHandler } from "./word-handlers/adverb-handler"
import { PrepositionHandler } from "./word-handlers/preposition-handler"
import { AdjectiveHandler } from "./word-handlers/adjective-handler"
import { CausativeHandler } from "./word-handlers/causative-handler"
import { RelativeHandler } from "./word-handlers/relative-handler"
import { ConjunctionHandler } from "./word-handlers/conjunction-handler"

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
                PartsOfSpeech.DT, PartsOfSpeech.PASSIVE, PartsOfSpeech.PRPQ,
                PartsOfSpeech.WHNoun
            ]
        const verbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.VB, PartsOfSpeech.VBD, PartsOfSpeech.VBZ,
                PartsOfSpeech.VBP, PartsOfSpeech.VBN, PartsOfSpeech.PsvAgr,
                PartsOfSpeech.InfAgr, PartsOfSpeech.TO, PartsOfSpeech.TENSE,
                PartsOfSpeech.PERFECTIVE, PartsOfSpeech.NEGATION,
                PartsOfSpeech.MD, PartsOfSpeech.QTense, PartsOfSpeech.VBG,
                PartsOfSpeech.PRESENT, PartsOfSpeech.PAST
            ]
        const adverbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.RB, PartsOfSpeech.RBR, PartsOfSpeech.RBS,
                PartsOfSpeech.WHAdverb
            ]
        const adjTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.JJ, PartsOfSpeech.JJR, PartsOfSpeech.JJS,
                PartsOfSpeech.AdvAgr, PartsOfSpeech.SUPERLATIVE,
                PartsOfSpeech.COMPARATIVE, PartsOfSpeech.AdjectivalNoun
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
        const conjTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.CONJUNCTION
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
        for (const tag of conjTags) {
            this.register(tag, new ConjunctionHandler())
        }
    }

    public getHandler(word: Word): WordHandler {
        const handler = this.registry.get(word.pos)
        if (!handler) {
            throw Error(`This word, '${word.name}', does not have a handler`)
        }
        return handler
    }
}