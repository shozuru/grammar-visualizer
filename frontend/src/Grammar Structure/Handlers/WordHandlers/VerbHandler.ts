import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import { ClauseBuilder } from "../../syntax/ClauseBuilder"
import { isECMPred } from "../../syntax/SyntaxMethods"
import { Predicate } from "../../syntax/Predicate"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { Clause } from "../../syntax/partsOfSpeech/Clause"

export class VerbHandler implements WordHandler {

    public shouldStartNewClause(word: Word, clauseBuilder: ClauseBuilder): boolean {
        return false
    }

    public handle(
        verbalWord: Word,
        clauseBuilder: ClauseBuilder
    ): ClauseBuilder | void {
        let pred: Predicate | null = clauseBuilder.getPredicate()
        if (pred instanceof Predicate) {
            if (isECMPred(pred)) {
                let subSubject: Noun = clauseBuilder.getNounStack()[0]
                console.log(`The victor of the 49th Hunger Games: ${subSubject.getName()}`)
                let mtxClause: Clause = clauseBuilder.build()
                console.log(mtxClause)
                let subClause: ClauseBuilder = new ClauseBuilder()
                subClause.receiveECM(subSubject)
                subClause.buildPredicate(verbalWord)
                return subClause

                throw Error(
                    "Good job, officer. Report to commander for further instructions."
                )
            }
            // start new clause with correct args
            // subject / object control  versus raising 
        } else {
            clauseBuilder.buildPredicate(verbalWord)
        }
    }
}