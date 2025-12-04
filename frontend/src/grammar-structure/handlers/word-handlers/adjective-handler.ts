import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import type { ClauseBuilder } from "../../builders/clause-builder"
import type { Predicate } from "../../syntax/predicate"
import type { HandlerMethods } from "../../parser"

export class AdjectiveHandler implements WordHandler {

    public handle(
        adjWord: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {
        if (this.isPredicateAdj(builder)) {
            builder.buildAdjective(adjWord)
            return
        }
        // [Good] ideas are scarce

        // This is a red balloon (this is a balloon that is red)
        // This is a birthday cake (this is a cake that is X a birthday)
        ctx.push(builder)
        return builder.buildAdjRelClause(adjWord)
    }

    private isPredicateAdj(cBuilder: ClauseBuilder): boolean {
        const pred: Predicate | null = cBuilder.getPredicate()
        if (!pred) return false
        return !pred.getSemanticContent()
    }
}