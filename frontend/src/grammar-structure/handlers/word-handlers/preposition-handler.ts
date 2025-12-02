import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import type { ClauseBuilder } from "../../builders/clause-builder"

export class PrepositionHandler implements WordHandler {

    public handle(prepWord: Word, builder: ClauseBuilder): void {
        builder.buildPreposition(prepWord)
    }
}