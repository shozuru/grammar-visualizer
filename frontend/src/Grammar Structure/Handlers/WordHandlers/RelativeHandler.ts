import { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Word } from "../../types/Word"
import type { WordHandler } from "./WordHandler"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { Predicate } from "../../syntax/Predicate"
import type { Clause } from "../../syntax/partsOfSpeech/Clause"
import type { HandlerMethods } from "../../Parser"

export class RelativeHandler implements WordHandler {

    public handle(
        relWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        let mPred: Predicate | null = cBuilder.getPredicate()

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
        let relNoun: Noun = cBuilder.yieldObjectRel()

        let mtxClause: Clause = cBuilder.build()
        ctx.add(mtxClause)

        let relClause: ClauseBuilder = new ClauseBuilder()
        relClause.receiveRel(relNoun)
        return relClause
    }

    private handleSubjectRel(
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder {
        // the person [that] knew my name is here
        // the person [that] i knew is here
        let relNoun: Noun = cBuilder.yieldSubjectRel()
        ctx.push(cBuilder)

        let relClause: ClauseBuilder = new ClauseBuilder()
        relClause.receiveRel(relNoun)
        return relClause
    }
}