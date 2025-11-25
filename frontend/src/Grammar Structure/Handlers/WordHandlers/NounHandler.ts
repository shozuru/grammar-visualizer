import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { HandlerMethods } from "../../Parser"
import type { Predicate } from "../../syntax/Predicate"
import { isDitransitive } from "../../syntax/SyntaxMethods"

export class NounHandler implements WordHandler {

    public handle(
        nominalWord: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {
        // This is the person it was done by.
        // I met the person the book was written by.

        // If there are two nouns in a row and they are after the verb and the 
        // verb is not ditransitive, it is likely one of these conditions.

        if (this.subRelWOutThat(builder)) {
            // The store I went to is here
            // The store *(that) was there is red
            return this.handleSubjectRel(builder, ctx, nominalWord)
        } else if (this.obRelWOutThat(builder)) {
            throw Error("I made it this far.")

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
        relClause.receiveRel(relNoun)
        return relClause
    }

    private obRelWOutThat(cBuilder: ClauseBuilder): boolean {
        const pred: Predicate | null = cBuilder.getPredicate()
        if (!pred) return false
        return (
            !isDitransitive(pred) &&
            cBuilder.getNounStack().length > 0
        )
    }
}