import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import type { ClauseBuilder } from "../../syntax/ClauseBuilder"
import { isNoun, isNounModifier } from "../../syntax/SyntaxMethods"

export class NounHandler implements WordHandler {
    shouldStartNewClause(word: Word, builder: ClauseBuilder): boolean {
        return false
    }
    handle(nominalWord: Word, builder: ClauseBuilder): void {
        if (isNoun(nominalWord)) {
            builder.addNoun(nominalWord)
        } else if (isNounModifier(nominalWord)) {
            builder.addMod(nominalWord)
        }
    }
}