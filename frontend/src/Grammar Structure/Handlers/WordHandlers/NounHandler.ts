import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../Builders/ClauseBuilder"

export class NounHandler implements WordHandler {

    public handle(nominalWord: Word, builder: ClauseBuilder): void {
        builder.buildNominal(nominalWord)
    }
}