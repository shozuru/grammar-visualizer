import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"

export class NounHandler implements WordHandler {

    public handle(nominalWord: Word, builder: ClauseBuilder): void {
        if (this.SubRelWOutThat(builder)) {
            // The store I went to is here
            // The store *(that) was there is red
            throw Error("I made it here")
            const relNoun: Noun = builder.yieldSubjectRel()
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
}