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
        if (isAdjunctRel(relWord)) return this.handleAdjunctRel(cBuilder, ctx)
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

    private handleWHNounRel(
        relWord: Word,
        cbuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        // I know [what] to [do about the keys]
        // I know [who] left

        // this should probably be updated to have it connected to some 
        // rel system one of which couples to the main clause
        // the other couples to the subordinate clause

        // make the relWord a Noun
        const relNoun: Noun = new Noun(relWord.name)
        // add the current word to the current clause
        cbuilder.receiveRelNoun(relNoun)
        // build the current clause
        const matrixClause: Clause = cbuilder.build()
        // add the current clause to the clause list
        ctx.add(matrixClause)
        // start a new clausebuilder
        const subClauseBuilder: ClauseBuilder = new ClauseBuilder()

        // if the next word is 'to':
        // add the current word as the object of the new clause
        // add the subject of the last clause as the subject of this clause

        // else:
        // add the current word as the subject of the new clause
        subClauseBuilder.receiveRelNoun(relNoun)

        // return the new clauseBuilder
        return subClauseBuilder
    }
}