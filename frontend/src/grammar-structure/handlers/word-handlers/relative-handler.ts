import { ClauseBuilder } from "../../builders/clause-builder"
import type { Word } from "../../types/word"
import type { WordHandler } from "./word-handler"
import type { Noun } from "../../syntax/parts-of-speech/noun"
import type { Predicate } from "../../syntax/predicate"
import { Clause } from "../../syntax/parts-of-speech/clause"
import type { HandlerMethods } from "../../parser"
import { isAdjunctRel } from "../../syntax/syntax-methods"
import type { PrepBuilder } from "../../builders/preposition-builder"

export class RelativeHandler implements WordHandler {

    public handle(
        relWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        if (isAdjunctRel(relWord)) return this.handleAdjunctRel(cBuilder, ctx)

        const mPred: Predicate | null = cBuilder.getPredicate()
        if (mPred) return this.handleObjectRel(cBuilder, ctx)

        return this.handleSubjectRel(cBuilder, ctx)
    }

    private handleObjectRel(
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder {
        // this is the person [that] knew my name
        // this is the person [that] I knew
        // technically ambiguous with adjuncts that follow
        const relNoun: Noun = cBuilder.yieldObjectRel()

        const mtxClause: Clause = cBuilder.build()
        ctx.add(mtxClause)

        const relClause: ClauseBuilder = new ClauseBuilder()
        relClause.receiveRelNoun(relNoun)
        return relClause
    }

    private handleSubjectRel(
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder {
        // the person [that] knew my name is here
        // the person [that] i knew is here
        const relNoun: Noun = cBuilder.yieldSubjectRel()
        ctx.push(cBuilder)
        const relClause: ClauseBuilder = new ClauseBuilder()
        relClause.receiveRelNoun(relNoun)
        return relClause
    }

    private handleAdjunctRel(
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder {
        // This is the place [where] I slept

        const adjunctNoun: Noun = builder.yieldObjectRel()
        const prep: PrepBuilder | undefined = builder.getUnfinishedPrep()
        const mtxClause: Clause = builder.build()
        ctx.add(mtxClause)
        const relClause: ClauseBuilder = new ClauseBuilder()

        if (prep) relClause.receiveRelPrep(adjunctNoun, prep)
        else relClause.receiveRelAdjunct(adjunctNoun)
        return relClause
    }
}