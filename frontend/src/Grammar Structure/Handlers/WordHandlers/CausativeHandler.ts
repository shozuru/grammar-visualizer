import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../Builders/ClauseBuilder"

export class CausativeHandler implements WordHandler {

    public handle(causeWord: Word, builder: ClauseBuilder): void {
        builder.buildCausative(causeWord)
    }
}