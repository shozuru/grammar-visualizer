import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import { ClauseBuilder } from "../../builders/clause-builder"
import {
    isECMPred, isInfAgr, isObjectControlPred, isRaisingPred,
    isTensedVerb, isWHWord
}
    from "../../syntax/syntax-methods"
import { Predicate } from "../../syntax/predicate"
import type { Noun } from "../../syntax/parts-of-speech/noun"
import type { Clause } from "../../syntax/parts-of-speech/clause"
import type { HandlerMethods } from "../../parser"

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
        ctx: HandlerMethods
    ): ClauseBuilder | void {
        // debugger
        const unfinishedClause: ClauseBuilder | undefined = ctx.peak()
        const currentPred: Predicate | null = cBuilder.getPredicate()
        // the person that knew me is here
        if (unfinishedClause && currentPred) {
            // the boy went to the school that is blue
            this.shipRelClause(cBuilder, ctx)
            return this.returnToMatrix(verbalWord, ctx)

        } else if (currentPred && isTensedVerb(verbalWord)) {
            // I know | he [left]
            // this will not work for something like [I know | I [leave]]
            const lastNoun: Noun = cBuilder.yieldLastNoun()
            console.log(`'${lastNoun.getName()}' is the last noun`)
            const matrix: Clause = cBuilder.build()
            ctx.add(matrix)
            const subCBuilder: ClauseBuilder = new ClauseBuilder()
            subCBuilder.receiveSubject(lastNoun)
            subCBuilder.buildPredicate(verbalWord)
            return subCBuilder

        } else if (currentPred) {
            return this.handleNonfinite(
                verbalWord, currentPred, cBuilder, ctx.add)

        } else if (this.isNonfiniteRelConj(verbalWord, cBuilder, ctx)) {
            // I know [what [[to] do]]
            const mCBuilder: ClauseBuilder = ctx.pop()
            const matrixSubject: Noun | null = mCBuilder.getSubject()
            if (!matrixSubject) {
                throw Error("Matrix clause does not have a subject")
            }
            const matrixClause: Clause = mCBuilder.build()
            ctx.add(matrixClause)
            cBuilder.receiveSubject(matrixSubject)

        } else {
            cBuilder.buildPredicate(verbalWord)
        }
    }

    private handleNonfinite(
        vWord: Word,
        pred: Predicate,
        cBuilder: ClauseBuilder,
        addClause: (c: Clause) => void
    ): ClauseBuilder {
        const predType: PredType = this.getPredType(pred)
        const subSubject: Noun = this.getYieldMethod(predType, cBuilder)()

        const mtxClause: Clause = cBuilder.build()
        addClause(mtxClause)

        const subClause: ClauseBuilder = new ClauseBuilder()
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

        const yieldMap: Map<PredType, () => Noun> = new Map([
            [PredType.ECM, () => cBuilder.yieldEcmNoun()],
            [PredType.OCONTROL, () => cBuilder.yieldOControlNoun()],
            [PredType.RAISING, () => cBuilder.yieldRaisingNoun()],
            [PredType.SCONTROL, () => cBuilder.yieldSControlNoun()]
        ])

        const yieldMethod = yieldMap.get(pType)
        if (!yieldMethod) {
            throw Error("Unable to get proper yield method for main verb.")
        }
        return yieldMethod
    }

    private shipRelClause(cBuilder: ClauseBuilder, ctx: HandlerMethods): void {
        const rClause: Clause = cBuilder.build()
        ctx.add(rClause)
    }

    private returnToMatrix(vWord: Word, ctx: HandlerMethods): ClauseBuilder {
        const matrix: ClauseBuilder = ctx.pop()
        matrix.buildPredicate(vWord)
        return matrix
    }

    private isNonfiniteRelConj(
        verbalWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): boolean {
        const pendingNoun: Noun | null = cBuilder.getPendingNoun()
        if (!pendingNoun) return false
        return (
            isInfAgr(verbalWord)
            && !!ctx.peak()
            && !cBuilder.getSubject()
            && isWHWord(pendingNoun.getName())
        )
    }
}