import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class NounHandler implements WordHandler {

    public shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }

    public handle(
        nominalWord: Word,
        builder: ClauseBuilder
    ): ClauseBuilder | void {
        builder.buildNominal(nominalWord)
    }
}