import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../Builders/ClauseBuilder"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"

export class NounHandler implements WordHandler {

    public handle(nominalWord: Word, builder: ClauseBuilder): void {
        if (this.SubRelWOutRel(builder)) {
            // The store I went to is here
            throw Error("I made it here")
        } else {
            builder.buildNominal(nominalWord)
        }
    }

    private SubRelWOutRel(cBuilder: ClauseBuilder): boolean {
        let subject: Noun | null = cBuilder.getSubject()
        return (
            !!subject &&
            !cBuilder.getPredicate() &&
            !cBuilder.VerbInProgress()
        )
    }
}