import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { HandlerMethods } from "../../Parser"

export class NounHandler implements WordHandler {

    public handle(
        nominalWord: Word,
        builder: ClauseBuilder,
        ctx: HandlerMethods
    ): void | ClauseBuilder {
        if (this.SubRelWOutThat(builder)) {
            // The store I went to is here
            // The store *(that) was there is red
            return this.handleSubjectRel(builder, ctx, nominalWord)
        } else {
            builder.buildNominal(nominalWord)
        }
    }

    private SubRelWOutThat(cBuilder: ClauseBuilder): boolean {
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
}