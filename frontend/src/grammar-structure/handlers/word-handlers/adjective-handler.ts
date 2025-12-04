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

        ctx.push(builder)
        // add this to the list of clauses using handlerMethods
        return builder.buildAdjRelClause(adjWord)
        // copy the last noun builder and put it into the relative clause's noun list (to get determiners and such)
        // when we get to the next word, we want to add that noun to both the relative clause and the main clause

        // This is a red balloon (this is a balloon that is red)
        // This is a birthday cake (this is a cake that is X a birthday)
    }

    private isPredicateAdj(cBuilder: ClauseBuilder): boolean {
        const pred: Predicate | null = cBuilder.getPredicate()
        if (!pred) return false
        return !pred.getSemanticContent()
    }
}