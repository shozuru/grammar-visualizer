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
        cbuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        let mPred: Predicate | null = cbuilder.getPredicate()

        if (mPred) {
            // this is the person [that] knew my name
            // this is the person [that] I knew
            // technically ambiguous with adjuncts that follow
            let relNoun: Noun = cbuilder.yieldObjectRel()

            let mtxClause: Clause = cbuilder.build()
            ctx.add(mtxClause)

            let relClause: ClauseBuilder = new ClauseBuilder()
            relClause.receiveRel(relNoun)
            return relClause
        }
        let relNoun: Noun = cbuilder.yieldSubjectRel()

        ctx.push(cbuilder)

        let relClause: ClauseBuilder = new ClauseBuilder()
        relClause.receiveRel(relNoun)
        return relClause
        // the person [that] knew my name is here
        // the person [that] i knew is here
    }
}