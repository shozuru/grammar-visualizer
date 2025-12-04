import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import type { ClauseBuilder } from "../../builders/clause-builder"

export class AdjectiveHandler implements WordHandler {

    public handle(adjWord: Word, builder: ClauseBuilder): void {
        builder.buildAdjective(adjWord)
        // This is a red balloon
        // This is a birthday cake
    }
}