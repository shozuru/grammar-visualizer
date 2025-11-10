import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"
import { isVerbAgr, isVerbModifier } from "../../syntax/SyntaxMethods"

export class VerbHandler implements WordHandler {

    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(verbalWord: Word, builder: ClauseBuilder): void {
        builder.buildPredicate(verbalWord)
    }
}