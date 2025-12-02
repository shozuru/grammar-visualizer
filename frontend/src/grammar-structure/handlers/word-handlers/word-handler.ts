import type { ClauseBuilder } from "../../builders/clause-builder";
import type { Word } from "../../types/word";
import type { HandlerMethods } from "../../parser";

export interface WordHandler {
    handle(
        word: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void
}