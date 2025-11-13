import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class PrepositionHandler implements WordHandler {

    public handle(prepWord: Word, builder: ClauseBuilder): void {
        builder.buildPreposition(prepWord)
    }
}