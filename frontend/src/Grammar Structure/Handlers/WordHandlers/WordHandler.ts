import type { ClauseBuilder } from "../../Builders/ClauseBuilder";
import type { Word } from "../../types/Word";
import type { HandlerMethods } from "../../Parser";

export interface WordHandler {
    handle(
        word: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void
}