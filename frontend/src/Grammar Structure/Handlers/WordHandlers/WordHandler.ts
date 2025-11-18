import type { ClauseBuilder } from "../../syntax/ClauseBuilder";
import type { Word } from "../../types/Word";
import type { Clause } from "../../syntax/partsOfSpeech/Clause";

export interface WordHandler {
    handle(
        word: Word,
        builder: ClauseBuilder,
        addClause: (c: Clause) => void
    ): ClauseBuilder | void
}