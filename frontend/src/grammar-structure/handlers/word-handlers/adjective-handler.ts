import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import { ClauseBuilder } from "../../builders/clause-builder"
import type { HandlerMethods } from "../../parser"
import { isMakeWithEllipsedVP } from "../../syntax/syntax-methods"

export class AdjectiveHandler implements WordHandler {

    public handle(
        adjWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {
        if (isMakeWithEllipsedVP(cBuilder)) {
            // I like the idea to make it [red]
            return this.handleEllipsedVP(cBuilder, ctx, adjWord)
        }
        if (this.isPredicateAdj(cBuilder)) {
            cBuilder.buildAdjective(adjWord)
            return
        }
        // [Good] ideas are scarce
        // This is a red balloon (this is a balloon that is red)
        // This is a birthday cake (this is a cake that is X a birthday)
        // This is an example sentence
        ctx.push(cBuilder)
        return cBuilder.buildAdjRelClause(adjWord)
    }

    private isPredicateAdj(cBuilder: ClauseBuilder): boolean {
        if (cBuilder.isLastBuilderNoun()) return false
        const pred = cBuilder.getUnfinishedPredicate()
        return pred ? !pred.getSemanticContent() : false
    }

    private handleEllipsedVP(
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods,
        adjWord: Word
    ): ClauseBuilder {

        // I made it [red]
        const lastNoun = cBuilder.yieldLastNoun()
        const matrix = cBuilder.build()
        const subAdverbs = cBuilder.yieldAmbiguousAdverbs()
        ctx.add(matrix)

        const subordinate = new ClauseBuilder()
        subordinate.receiveSubject(lastNoun)
        subordinate.buildAdjPredicate(adjWord, subAdverbs)
        return subordinate
    }
}