import type { WordHandler } from "./word-handler"
import type { Word } from "../../types/word"
import { ClauseBuilder } from "../../builders/clause-builder"
import {
    isBeVerb,
    isECMPred, isInfAgr, isIngVerb, isObjectControlPred, isRaisingPred,
    isVerb, isWHWord
}
    from "../../syntax/syntax-methods"
import { Predicate } from "../../syntax/predicate"
import { Noun } from "../../syntax/parts-of-speech/noun"
import type { Clause } from "../../syntax/parts-of-speech/clause"
import type { HandlerMethods } from "../../parser"
import { PartsOfSpeech } from "../../syntax/syntax-constants"

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
        const currentPred: Predicate | undefined = cBuilder.getPredicate()
        // the person that knew me is here
        if (unfinishedClause && currentPred) {
            // the boy went to the school that is blue
            this.shipRelClause(cBuilder, ctx)
            return this.returnToMatrix(verbalWord, ctx)
        }
        if (currentPred
            && !(this.checkPredAgrStack(currentPred, PartsOfSpeech.InfAgr))
            && isVerb(verbalWord)
        ) {
            // I know | he [left]
            // I know | we [leave] 
            currentPred.getAgrStack()
            const lastNoun = cBuilder.yieldLastNoun()
            const matrix = cBuilder.build()
            ctx.add(matrix)
            const subCBuilder = new ClauseBuilder()
            subCBuilder.receiveSubject(lastNoun)
            subCBuilder.buildPredicate(verbalWord)
            return subCBuilder
        }
        if (
            isIngVerb(verbalWord)
            && cBuilder.hasPrepWithObject()
        ) return this.handleIngSubordinate(verbalWord, cBuilder, ctx, true)

        if (
            isIngVerb(verbalWord)
            && cBuilder.hasUnfinishedPrep()
        ) return this.handleIngSubordinate(verbalWord, cBuilder, ctx, false)

        if (currentPred) {
            return this.handleNonfinite(
                verbalWord, currentPred, cBuilder, ctx.add
            )
        }
        if (this.isNonfiniteRelConj(verbalWord, cBuilder, ctx)) {
            const mCBuilder = ctx.pop()
            const matrixSubject = mCBuilder.getSubject()
            if (!matrixSubject) {
                throw Error("Matrix clause does not have a subject")
            }
            const matrixClause = mCBuilder.build()
            ctx.add(matrixClause)
            cBuilder.receiveSubject(matrixSubject)
            return
        }
        cBuilder.buildPredicate(verbalWord)
    }

    private handleNonfinite(
        vWord: Word,
        pred: Predicate,
        cBuilder: ClauseBuilder,
        addClause: (c: Clause) => void
    ): ClauseBuilder {
        // handles nonfinite verbs when verb appears with 'to' or bare
        // eg: ECM, Subject Control, Object Control, Raising

        const subClause = new ClauseBuilder()
        const predType = this.getPredType(pred)
        const subSubject = this.yieldSubject(predType, cBuilder)

        if (this.isBeVerb(pred)) {
            //e.g. This [is] a cake to eat
            const subject = new Noun("PRO")
            subClause.receiveSubject(subject)
            subClause.receiveObject(subSubject)
        } else {
            // e.g. I [used] him to win
            subClause.receiveSubject(subSubject)
        }
        const mtxClause = cBuilder.build()
        addClause(mtxClause)

        subClause.buildPredicate(vWord)
        return subClause
    }

    private getPredType(pred: Predicate): PredType {
        if (isECMPred(pred)) return PredType.ECM
        if (isObjectControlPred(pred)) return PredType.OCONTROL
        if (isRaisingPred(pred)) return PredType.RAISING
        return PredType.SCONTROL
    }

    private isBeVerb(predicate: Predicate): boolean {
        const copula = predicate.getCopula()
        if (!copula) return false
        return (isBeVerb(copula.getName()))
    }

    private yieldSubject(
        pType: PredType,
        cBuilder: ClauseBuilder
    ): Noun {
        if (pType === PredType.ECM) return cBuilder.yieldEcmNoun()
        if (pType === PredType.RAISING) return cBuilder.yieldRaisingNoun()
        if (pType === PredType.OCONTROL) return cBuilder.yieldOControlNoun()
        return cBuilder.yieldSControlNoun()
    }

    private shipRelClause(cBuilder: ClauseBuilder, ctx: HandlerMethods): void {
        const rClause = cBuilder.build()
        ctx.add(rClause)
    }

    private returnToMatrix(vWord: Word, ctx: HandlerMethods): ClauseBuilder {
        const matrix = ctx.pop()
        matrix.buildPredicate(vWord)
        return matrix
    }

    private isNonfiniteRelConj(
        verbalWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods
    ): boolean {
        const pendingNoun = cBuilder.getPendingNoun()
        if (!pendingNoun) return false
        return (
            isInfAgr(verbalWord)
            && !!ctx.peak()
            && !cBuilder.getSubject()
            && isWHWord(pendingNoun.getName())
        )
    }

    private checkPredAgrStack(pred: Predicate, pos: number): boolean {
        const agrStack = pred.getAgrStack()
        return agrStack.some((agr) => {
            agr.getPos() === pos
        })
    }

    private handleIngSubordinate(
        verbalWord: Word,
        cBuilder: ClauseBuilder,
        ctx: HandlerMethods,
        hasObject: boolean
    ): ClauseBuilder {
        // I (hardly) knew about John (quickly) [going] to the park
        // I knew about John quickly going to the park
        // I quickly knew about John going to the park
        // I knew about [going] to the park
        let subject = undefined
        if (hasObject) {
            subject = cBuilder.yieldLastPrepObject()
        } else {
            subject = cBuilder.getSubject()
            cBuilder.buildPrepWithoutObject()
        }
        if (!subject) {
            throw Error("Tried to get subject from sentence lacking one")
        }

        const adverbList = cBuilder.yieldAmbiguousAdverbs()
        const matrix = cBuilder.build()
        ctx.add(matrix)
        const subordinate = new ClauseBuilder()
        subordinate.receiveSubject(subject)
        subordinate.receiveAmbiguousAdverbs(adverbList)
        subordinate.buildPredicate(verbalWord)
        return subordinate
    }
}