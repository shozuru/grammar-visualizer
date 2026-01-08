import { ClauseBuilder } from "../../builders/clause-builder"
import type { Word } from "../../types/word"
import type { WordHandler } from "./word-handler"
import { Noun } from "../../syntax/parts-of-speech/noun"
import type { Predicate } from "../../syntax/predicate"
import { Clause } from "../../syntax/parts-of-speech/clause"
import type { HandlerMethods } from "../../parser"
import { isAdjunctRel, isWHNounRel } from "../../syntax/syntax-methods"
import type { PrepBuilder } from "../../builders/preposition-builder"

export class RelativeHandler implements WordHandler {

    public handle(
        relWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        if (isAdjunctRel(relWord)) {
            return this.handleAdjunctRel(cBuilder, relWord, ctx)
        }
        if (isWHNounRel(relWord)) {
            return this.handleWHNounRel(relWord, cBuilder, ctx)
        }
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
        const relNoun: Noun | null = cBuilder.yieldObjectRel()
        if (!relNoun) {
            throw Error("Error trying to obtain object relative noun")
        }

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
        cBuilder: ClauseBuilder,
        relWord: Word,
        ctx: HandlerMethods
    ): ClauseBuilder {
        const adjunctNoun: Noun | null = cBuilder.yieldObjectRel()
        if (adjunctNoun) {
            // This is the place [where] I slept
            const prep: PrepBuilder | undefined = cBuilder.getUnfinishedPrep()
            const mtxClause: Clause = cBuilder.build()
            ctx.add(mtxClause)
            const relClause: ClauseBuilder = new ClauseBuilder()

            if (prep) relClause.receiveRelPrep(adjunctNoun, prep)
            else relClause.receiveRelAdjunct(adjunctNoun)
            return relClause
        } else {
            // this is [where] to sleep
            const relative: Noun = new Noun('REL')
            cBuilder.receiveRelNoun(relative)
            const whNoun: Noun = new Noun(relWord.name)
            ctx.push(cBuilder)
            const subClauseBuilder: ClauseBuilder = new ClauseBuilder()
            subClauseBuilder.receiveRelNoun(whNoun)
            return subClauseBuilder
        }
    }

    private handleWHNounRel(
        relWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        // I know [what] to [do about the keys]
        // I know | [who] left
        // I know [who] | to leave
        // I know [who] I should see

        // I know [the thing] to say
        // I know [the place] to be at
        const whNoun: Noun = new Noun(relWord.name)
        const relative: Noun = whNoun.connectAndReturnRelNoun()
        cBuilder.receiveRelNoun(relative)
        ctx.push(cBuilder)
        const subClauseBuilder: ClauseBuilder = new ClauseBuilder()
        subClauseBuilder.receiveRelNoun(whNoun)
        return subClauseBuilder
    }
}