import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import { ClauseBuilder } from "../../builders/clause-builder"
import type { HandlerMethods } from "../../parser"
import { Predicate } from "../../syntax/predicate"
import {
    isDitransitive, isMakeWithEllipsedVP, isNounPred,
    isPassive,
    isPrepPred
} from "../../syntax/syntax-methods"
import type { Clause } from "../../syntax/parts-of-speech/clause"

export class NounHandler implements WordHandler {

    public handle(
        nominalWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {
        if (isMakeWithEllipsedVP(cBuilder)) {
            // I like the idea to make it [a square]
            return this.handleEllipsedVP(cBuilder, ctx, nominalWord)
        }
        if (this.hasAdjRelClause(cBuilder)) {
            return this.handleAdjRelClause(cBuilder, ctx, nominalWord)
        }
        if (this.subRelWOutThat(cBuilder)) {
            // The store I went to is here
            // The store *(that) was there is old
            return this.handleSubjectRel(cBuilder, ctx, nominalWord)
        }
        if (this.isObjectRel(nominalWord, cBuilder)) {
            // This is the person [I] know
            // This is the person [it] was done by.
            // I met the person [it] was written by.
            return this.handleObjectRel(cBuilder, ctx, nominalWord)
        }
        cBuilder.buildNominal(nominalWord)
    }

    private handleAdjRelClause(
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods,
        nominalWord: Word
    ): ClauseBuilder {
        cBuilder.buildNominal(nominalWord)
        const relClause: Clause = cBuilder.build()
        ctx.add(relClause)
        const mBuilder: ClauseBuilder = ctx.pop()
        mBuilder.buildNominal(nominalWord)
        return mBuilder
    }

    private isObjectRel(nominalWord: Word, cBuilder: ClauseBuilder): boolean {
        return (
            !isPassive(nominalWord)
            && this.obRelWOutThat(cBuilder)
        )
    }

    private subRelWOutThat(cBuilder: ClauseBuilder): boolean {
        const subject = cBuilder.getSubject()
        return (
            !!subject &&
            !cBuilder.getPredicate() &&
            !cBuilder.verbInProgress()
        )
    }

    private handleSubjectRel(
        builder: ClauseBuilder,
        ctx: HandlerMethods,
        noun: Word
    ): void | ClauseBuilder {
        const relNoun = builder.yieldSubjectRel()
        ctx.push(builder)
        const relClause = new ClauseBuilder()
        relClause.buildNominal(noun)
        relClause.receiveRelNoun(relNoun)
        return relClause
    }

    private handleObjectRel(
        builder: ClauseBuilder,
        ctx: HandlerMethods,
        noun: Word
    ): void | ClauseBuilder {
        const relNoun = builder.yieldObjectRel()
        const mtxClause = builder.build()
        ctx.add(mtxClause)
        const relClause = new ClauseBuilder()
        if (relNoun) {
            relClause.receiveRelNoun(relNoun)
        }
        relClause.buildNominal(noun)
        return relClause
    }

    private obRelWOutThat(cBuilder: ClauseBuilder): boolean {
        // They are at the school [I] went to
        const pred = cBuilder.getPredicate()
        if (!pred) return false

        return (
            !cBuilder.hasUnfinishedPrep() &&
            !isDitransitive(pred) &&
            this.hasObjectNoun(pred, cBuilder)
        )
    }

    private hasObjectNoun(pred: Predicate, builder: ClauseBuilder): boolean {
        return (
            isNounPred(pred) ||
            isPrepPred(pred) ||
            builder.getNounStack().length > 0
        )
    }

    private hasAdjRelClause(cBuilder: ClauseBuilder): boolean {
        const pred = cBuilder.getPredicate()
        if (!pred) return false

        const content = pred.getSemanticContent()
        if (!content) return false

        const subject = cBuilder.getSubject()
        return !subject
    }

    private handleEllipsedVP(
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods,
        nWord: Word
    ): ClauseBuilder {
        // I made it [[a] cat]
        const lastNoun = cBuilder.yieldLastNoun()
        const matrix = cBuilder.build()
        ctx.add(matrix)

        const subordinate = new ClauseBuilder()
        subordinate.receiveSubject(lastNoun)
        subordinate.buildNounPred(nWord)

        return subordinate
    }
}