import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import type { ClauseBuilder } from "../../builders/clause-builder"

export class AdverbHandler implements WordHandler {

    public handle(adverbWord: Word, builder: ClauseBuilder): void {
        // That is a [very] good idea
        // Very good ideas are hard to come by
        // if (builder.)


        // I [quickly] ran
        // I ran [quickly]



        builder.buildAdverb(adverbWord)
    }
}