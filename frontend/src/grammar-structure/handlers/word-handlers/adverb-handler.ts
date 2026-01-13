import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import type { ClauseBuilder } from "../../builders/clause-builder"

export class AdverbHandler implements WordHandler {

    public handle(adverbWord: Word, cbuilder: ClauseBuilder): void {
        cbuilder.buildAdverb(adverbWord)
    }
}