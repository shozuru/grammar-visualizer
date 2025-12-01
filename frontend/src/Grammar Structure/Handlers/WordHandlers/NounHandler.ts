import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { HandlerMethods } from "../../Parser"
import type { Predicate } from "../../syntax/Predicate"
import {
    isDitransitive, isNounPred,
    isPassive
} from "../../syntax/SyntaxMethods"
import type { Clause } from "../../syntax/partsOfSpeech/Clause"

export class NounHandler implements WordHandler {

    public handle(
        nominalWord: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {

        if (this.subRelWOutThat(builder)) {
            // The store I went to is here
            // The store *(that) was there is red
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
        const pred: Predicate | null = cBuilder.getPredicate()
        if (!pred) return false

        return (
            !isDitransitive(pred) &&
            this.hasObjectNoun(pred, cBuilder)
        )
    }

    private hasObjectNoun(pred: Predicate, builder: ClauseBuilder): boolean {
        return (
            isNounPred(pred) ||
            builder.getNounStack().length > 0
        )
    }
}