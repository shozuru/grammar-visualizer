import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class VerbHandler implements WordHandler {

    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(word: Word, builder: ClauseBuilder): void {

    }
}