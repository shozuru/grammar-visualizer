import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import { ClauseBuilder } from "../../syntax/ClauseBuilder"
import { isECMPred, isObjectControlPred, isRaisingPred, isRosVerb } from "../../syntax/SyntaxMethods"
import { Predicate } from "../../syntax/Predicate"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { Clause } from "../../syntax/partsOfSpeech/Clause"

export class VerbHandler implements WordHandler {

    private shouldStartNewClause(pred: Predicate | null): boolean {
        if (!(pred instanceof Predicate)) {
            return false
        }
        return (
            isECMPred(pred) ||
            isRosVerb(pred)
        )
    }

    public handle(
        verbalWord: Word,
        clauseBuilder: ClauseBuilder
    ): ClauseBuilder | void {
        let pred: Predicate | null = clauseBuilder.getPredicate()
        if (pred instanceof Predicate) {
            if (isECMPred(pred)) {
                let subSubject: Noun = clauseBuilder.yieldEcmNoun()
                let mtxClause: Clause = clauseBuilder.build()
                console.log(mtxClause)
                let subClause: ClauseBuilder = new ClauseBuilder()
                subClause.receiveSubject(subSubject)
                subClause.buildPredicate(verbalWord)
                return subClause
            } else if (isObjectControlPred(pred)) {
                let subSubject: Noun = clauseBuilder.yeildOControlNoun()
                let mtxClause: Clause = clauseBuilder.build()
                console.log(mtxClause)
                let subClause: ClauseBuilder = new ClauseBuilder()
                subClause.receiveSubject(subSubject)
                return subClause
            } else if (isRaisingPred(pred)) {
                let subSubject: Noun = clauseBuilder.yieldRaisingNoun()
                let mtxClause: Clause = clauseBuilder.build()
                console.log(mtxClause)
                let subClause: ClauseBuilder = new ClauseBuilder()
                subClause.receiveSubject(subSubject)
                return subClause
            } else {
                // it is likely something where the subject gets COPIED over
            }
        } else {
            clauseBuilder.buildPredicate(verbalWord)
        }
    }
}