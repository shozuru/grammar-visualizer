import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class CausativeHandler implements WordHandler {

    public shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }

    public handle(causeWord: Word, builder: ClauseBuilder): void {
        builder.buildCausative(causeWord)
    }
}