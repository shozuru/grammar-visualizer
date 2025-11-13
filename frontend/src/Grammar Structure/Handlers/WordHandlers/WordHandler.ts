import type { ClauseBuilder } from "../../syntax/ClauseBuilder";
import type { Word } from "../../types/Word";

export interface WordHandler {
    handle(word: Word, builder: ClauseBuilder): ClauseBuilder | void
}