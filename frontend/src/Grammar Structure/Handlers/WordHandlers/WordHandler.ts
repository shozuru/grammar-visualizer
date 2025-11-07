import type { ClauseBuilder } from "../../syntax/ClauseBuilder";
import type { Word } from "../../types/Word";

export interface WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean
    handle(word: Word, builder: ClauseBuilder): void
}