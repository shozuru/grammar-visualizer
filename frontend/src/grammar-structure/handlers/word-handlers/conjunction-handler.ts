import { ClauseBuilder } from "../../builders/clause-builder";
import type { HandlerMethods } from "../../parser";
import type { Word } from "../../types/word";
import type { WordHandler } from "./word-handler";

export class ConjunctionHandler implements WordHandler {

    public handle(
        conjunction: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        console.log(`Hi, I'm ${conjunction.name}`)
        const completedClause = cBuilder.build()
        ctx.add(completedClause)
        const newClauseBuilder = new ClauseBuilder()
        return newClauseBuilder
    }
}