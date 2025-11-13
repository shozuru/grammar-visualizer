import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"

export class AdverbHandler implements WordHandler {

    public handle(adverbWord: Word, builder: ClauseBuilder): void {
        builder.buildAdverb(adverbWord)
    }
}