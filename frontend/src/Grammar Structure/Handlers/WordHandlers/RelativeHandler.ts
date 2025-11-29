import { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Word } from "../../types/Word"
import type { WordHandler } from "./WordHandler"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { Predicate } from "../../syntax/Predicate"
import { Clause } from "../../syntax/partsOfSpeech/Clause"
import type { HandlerMethods } from "../../Parser"
import { isAdjunctRel } from "../../syntax/SyntaxMethods"
import type { PrepBuilder } from "../../Builders/PrepositionBuilder"

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