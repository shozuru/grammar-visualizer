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
        cBuilder: ClauseBuilder,
        addClause: (c: Clause) => void
    ): ClauseBuilder | void {
        let matrixPred: Predicate | null = cBuilder.getPredicate()
        if (matrixPred) {
            return this.handleMClause(verbalWord, matrixPred,
                cBuilder, addClause)
        } else {
            cBuilder.buildPredicate(verbalWord)
        }
    }

    private handleMClause(
        vWord: Word,
        pred: Predicate,
        cBuilder: ClauseBuilder,
        addClause: (c: Clause) => void
    ): ClauseBuilder {
        let predType: PredType = this.getPredType(pred)
        let subSubject: Noun = this.getYieldMethod(predType, cBuilder)()

        let mtxClause: Clause = cBuilder.build()
        addClause(mtxClause)

        let subClause: ClauseBuilder = new ClauseBuilder()
        subClause.receiveSubject(subSubject)

        if (predType === PredType.ECM) {
            subClause.buildPredicate(vWord)
        }
        return subClause
    }

    private getPredType(pred: Predicate): PredType {
        if (isECMPred(pred)) return PredType.ECM
        if (isObjectControlPred(pred)) return PredType.OCONTROL
        if (isRaisingPred(pred)) return PredType.RAISING
        else return PredType.SCONTROL
    }

    private getYieldMethod(
        pType: PredType,
        cBuilder: ClauseBuilder
    ): () => Noun {

        let yieldMap: Map<PredType, () => Noun> = new Map([
            [PredType.ECM, () => cBuilder.yieldEcmNoun()],
            [PredType.OCONTROL, () => cBuilder.yieldOControlNoun()],
            [PredType.RAISING, () => cBuilder.yieldRaisingNoun()],
            [PredType.SCONTROL, () => cBuilder.yieldSControlNoun()]
        ])

        let yieldMethod = yieldMap.get(pType)
        if (!yieldMethod) {
            throw Error("Unable to get proper yield method for main verb.")
        }
        return yieldMethod
    }
}