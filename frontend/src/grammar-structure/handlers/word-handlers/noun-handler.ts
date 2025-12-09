import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import { ClauseBuilder } from "../../builders/clause-builder"
import type { Noun } from "../../syntax/parts-of-speech/noun"
import type { HandlerMethods } from "../../parser"
import type { Predicate } from "../../syntax/predicate"
import type { Phrase } from "../../syntax/parts-of-speech/phrase"
import {
    isDitransitive, isNounPred,
    isPassive,
    isPrepPred
} from "../../syntax/syntax-methods"
import type { Clause } from "../../syntax/parts-of-speech/clause"

export class NounHandler implements WordHandler {

    public handle(
        nominalWord: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {
        if (this.hasAdjRelClause(builder)) {
            builder.buildNominal(nominalWord)
            const relClause: Clause = builder.build()
            ctx.add(relClause)
            const mBuilder: ClauseBuilder = ctx.pop()
            mBuilder.buildNominal(nominalWord)
            return mBuilder

        } else if (this.subRelWOutThat(builder)) {
            // The store I went to is here
            // The store *(that) was there is old
            return this.handleSubjectRel(builder, ctx, nominalWord)

        } else if (
            !isPassive(nominalWord) &&
            this.obRelWOutThat(builder)
        ) {
            // This is the person [I] know
            // This is the person [it] was done by.
            // I met the person [it] was written by.
            return this.handleObjectRel(builder, ctx, nominalWord)

        } else {
            builder.buildNominal(nominalWord)
        }
    }

    private subRelWOutThat(cBuilder: ClauseBuilder): boolean {
        const subject: Noun | null = cBuilder.getSubject()
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
        const relNoun: Noun = builder.yieldSubjectRel()
        ctx.push(builder)
        const relClause: ClauseBuilder = new ClauseBuilder()
        relClause.buildNominal(noun)
        relClause.receiveRelNoun(relNoun)
        return relClause
    }

    private handleObjectRel(
        builder: ClauseBuilder,
        ctx: HandlerMethods,
        noun: Word
    ): void | ClauseBuilder {
        const relNoun: Noun = builder.yieldObjectRel()
        const mtxClause: Clause = builder.build()
        ctx.add(mtxClause)
        const relClause: ClauseBuilder = new ClauseBuilder()
        relClause.receiveRelNoun(relNoun)
        relClause.buildNominal(noun)
        return relClause
    }

    private obRelWOutThat(cBuilder: ClauseBuilder): boolean {
        // They are at the school [I] went to
        const pred: Predicate | null = cBuilder.getPredicate()
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
        const pred: Predicate | null = cBuilder.getPredicate()
        if (!pred) return false

        const content: Phrase | null = pred.getSemanticContent()
        if (!content) return false

        const subject: Noun | null = cBuilder.getSubject()
        return !subject
    }
}