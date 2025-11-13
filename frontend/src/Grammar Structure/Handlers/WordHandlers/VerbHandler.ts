import type { WordHandler } from "./WordHandler"
import type { Word } from "../../types/Word"
import { ClauseBuilder } from "../../syntax/ClauseBuilder"
import { isECMPred, isObjectControlPred, isRaisingPred }
    from "../../syntax/SyntaxMethods"
import { Predicate } from "../../syntax/Predicate"
import type { Noun } from "../../syntax/partsOfSpeech/Noun"
import type { Clause } from "../../syntax/partsOfSpeech/Clause"

enum PredType {
    ECM,
    OCONTROL,
    RAISING,
    SCONTROL
}

export class VerbHandler implements WordHandler {

    public handle(
        verbalWord: Word,
        clauseBuilder: ClauseBuilder
    ): ClauseBuilder | void {
        let pred: Predicate | null = clauseBuilder.getPredicate()
        if (pred) {
            let action = this.getPredAction(pred)
            return action(verbalWord, clauseBuilder)
        } else {
            clauseBuilder.buildPredicate(verbalWord)
        }
    }

    private handleECM(vWord: Word, cBuilder: ClauseBuilder): ClauseBuilder {
        let subSubject: Noun = cBuilder.yieldEcmNoun()
        let mtxClause: Clause = cBuilder.build()
        console.log(mtxClause)
        let subClause: ClauseBuilder = new ClauseBuilder()
        subClause.receiveSubject(subSubject)
        subClause.buildPredicate(vWord)
        return subClause
    }

    private handleOControl(cBuilder: ClauseBuilder): ClauseBuilder {
        let subSubject: Noun = cBuilder.yeildOControlNoun()
        let mtxClause: Clause = cBuilder.build()
        console.log(mtxClause)
        let subClause: ClauseBuilder = new ClauseBuilder()
        subClause.receiveSubject(subSubject)
        return subClause
    }

    private handleRaising(cBuilder: ClauseBuilder): ClauseBuilder {
        let subSubject: Noun = cBuilder.yieldRaisingNoun()
        let mtxClause: Clause = cBuilder.build()
        console.log(mtxClause)
        let subClause: ClauseBuilder = new ClauseBuilder()
        subClause.receiveSubject(subSubject)
        return subClause
    }

    private handleSControl(cBuilder: ClauseBuilder): ClauseBuilder {
        let subSubject: Noun = cBuilder.yieldSControlNoun()
        let mtxClause: Clause = cBuilder.build()
        console.log(mtxClause)
        let subClause: ClauseBuilder = new ClauseBuilder()
        subClause.receiveSubject(subSubject)
        return subClause
    }

    private getPredType(pred: Predicate): PredType {
        if (isECMPred(pred)) return PredType.ECM
        if (isObjectControlPred(pred)) return PredType.OCONTROL
        if (isRaisingPred(pred)) return PredType.RAISING
        else return PredType.SCONTROL
    }

    private getPredAction(pred: Predicate) {
        let controlMap = new Map([
            [PredType.ECM, (verb: Word, clause: ClauseBuilder) =>
                this.handleECM(verb, clause)],
            [PredType.OCONTROL, (_verb: Word, clause: ClauseBuilder) =>
                this.handleOControl(clause)],
            [PredType.RAISING, (_verb: Word, clause: ClauseBuilder) =>
                this.handleRaising(clause)],
            [PredType.SCONTROL, (_verb: Word, clause: ClauseBuilder) =>
                this.handleSControl(clause)],
        ])
        let pType: PredType = this.getPredType(pred)
        let vHandler = controlMap.get(pType)
        if (!vHandler) {
            throw Error("Unable to get proper handler for main verb.")
        }
        return vHandler
    }
}