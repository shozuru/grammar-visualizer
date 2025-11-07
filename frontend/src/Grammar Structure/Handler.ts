import type { ClauseBuilder } from "./syntax/ClauseBuilder";
import { PartsOfSpeech } from "./syntax/SyntaxConstants";
import type { Word } from "./types/Word";

export interface WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean
    handle(word: Word, builder: ClauseBuilder): void
}

export class DefaultHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(word: Word, builder: ClauseBuilder): void {

    }
}

export class VerbHandler implements WordHandler {

    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(word: Word, builder: ClauseBuilder): void {

    }
}

export class NounHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(word: Word, builder: ClauseBuilder): void {

    }
}

export class AdverbHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(word: Word, builder: ClauseBuilder): void {

    }
}

export class PrepositionHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(word: Word, builder: ClauseBuilder): void {

    }
}

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
                PartsOfSpeech.NNPS
            ]
        let verbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.VB, PartsOfSpeech.VBD, PartsOfSpeech.VBZ,
                PartsOfSpeech.VBP, PartsOfSpeech.VBN

            ]
        let adverbTags: PartsOfSpeech[] =
            [
                PartsOfSpeech.RB, PartsOfSpeech.RBR, PartsOfSpeech.RBS
            ]
        let prepTags: PartsOfSpeech[] = [PartsOfSpeech.IN]
        for (let tag of nounTags) {
            this.register(tag, new NounHandler())
        }
        for (let tag of verbTags) {
            this.register(tag, new VerbHandler())
        }
        for (let tag of adverbTags) {
            this.register(tag, new AdverbHandler())
        }
        for (let tag of prepTags) {
            this.register(tag, new PrepositionHandler())
        }
    }

    public get(word: Word): WordHandler {
        let handler = this.registry.get(word.pos)
        if (!handler) { throw new Error(`No handler for POS: ${word.pos}`) }
        return handler
    }
}