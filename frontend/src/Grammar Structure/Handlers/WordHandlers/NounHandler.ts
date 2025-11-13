import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class NounHandler implements WordHandler {

    public handle(nominalWord: Word, builder: ClauseBuilder): void {
        builder.buildNominal(nominalWord)
    }
}