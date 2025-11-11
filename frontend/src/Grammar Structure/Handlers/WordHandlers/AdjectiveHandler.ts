import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class AdjectiveHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(adjWord: Word, builder: ClauseBuilder): void {
        builder.buildAdjective(adjWord)
    }
}