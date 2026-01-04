import { ClauseBuilder } from "../../builders/clause-builder";
import type { HandlerMethods } from "../../parser";
import type { Clause } from "../../syntax/parts-of-speech/clause";
import type { Word } from "../../types/word";
import type { WordHandler } from "./word-handler";

export class ConjunctionHandler implements WordHandler {

    public handle(
        conjunction: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        const completedClause: Clause = cBuilder.build()
        ctx.add(completedClause)
        const newClauseBuilder: ClauseBuilder = new ClauseBuilder()
        return newClauseBuilder
    }
}