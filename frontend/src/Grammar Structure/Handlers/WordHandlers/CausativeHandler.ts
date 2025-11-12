import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class CausativeHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(causeWord: Word, builder: ClauseBuilder): void {
        builder.buildCausative(causeWord)
    }
}