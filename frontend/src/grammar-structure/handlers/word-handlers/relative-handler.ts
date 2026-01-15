import { ClauseBuilder } from "../../builders/clause-builder"
import type { Word } from "../../types/word"
import type { WordHandler } from "./word-handler"
import { Noun } from "../../syntax/parts-of-speech/noun"
import type { HandlerMethods } from "../../parser"
import { isAdjunctRel, isWHNounRel } from "../../syntax/syntax-methods"

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
        const mPred = cBuilder.getPredicate()
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
        const relNoun = cBuilder.yieldObjectRel()
        if (!relNoun) {
            throw Error("Error trying to obtain object relative noun")
        }

        const mtxClause = cBuilder.build()
        ctx.add(mtxClause)

        const relClause = new ClauseBuilder()
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
        const adjunctNoun = cBuilder.yieldObjectRel()
        if (adjunctNoun) {
            // This is the place [where] I slept
            const prep = cBuilder.getUnfinishedPrep()
            const mtxClause = cBuilder.build()
            ctx.add(mtxClause)
            const relClause = new ClauseBuilder()

            if (prep) relClause.receiveRelPrep(adjunctNoun, prep)
            else relClause.receiveRelAdjunct(adjunctNoun)
            return relClause
        } else {
            // this is [where] to sleep
            const relative = new Noun('REL')
            cBuilder.receiveRelNoun(relative)
            const whNoun = new Noun(relWord.name)
            ctx.push(cBuilder)
            const subClauseBuilder = new ClauseBuilder()
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
        const whNoun = new Noun(relWord.name)
        const relative = whNoun.connectAndReturnRelNoun()
        cBuilder.receiveRelNoun(relative)
        ctx.push(cBuilder)
        const subClauseBuilder = new ClauseBuilder()
        subClauseBuilder.receiveRelNoun(whNoun)
        return subClauseBuilder
    }
}