import type { Pair } from "../types/Pair"
import { Noun } from "./partsOfSpeech/Noun"
import { Verb } from "./partsOfSpeech/Verb"
import { Clause } from "./partsOfSpeech/Clause"
import {
    conjunctions, ecmVerbs, objectControlVerbs, PartsOfSpeech,
    raisingVerbs
} from "./SyntaxConstants"

export function isNoun(wordPair: Pair): boolean {
    let currentPOS: number = wordPair.pos
    return (currentPOS === PartsOfSpeech.NN ||
        currentPOS === PartsOfSpeech.NNS ||
        currentPOS === PartsOfSpeech.NNP ||
        currentPOS === PartsOfSpeech.NNPS ||
        currentPOS === PartsOfSpeech.PRP ||
        currentPOS === PartsOfSpeech.FW
    )
}

export function isVerbModifier(wordPair: Pair): boolean {
    let wordPos: number = wordPair.pos
    return (
        wordPos === PartsOfSpeech.TENSE ||
        wordPos === PartsOfSpeech.PERFECTIVE ||
        wordPos === PartsOfSpeech.NEGATION ||
        wordPos === PartsOfSpeech.QuestionTense ||
        wordPos === PartsOfSpeech.MD
    )
}

export function isNounModifier(wordPair: Pair): boolean {
    let currentPOS: number = wordPair.pos
    return (
        currentPOS === PartsOfSpeech.DT ||
        currentPOS === PartsOfSpeech.PRPQ
    )
}

export function isCausative(wordPair: Pair): boolean {
    if (
        wordPair.pos === PartsOfSpeech.CAUSATIVE
    ) {
        return true
    }
    return false
}

export function isPassive(wordPair: Pair): boolean {
    if (
        wordPair.pos === PartsOfSpeech.PASSIVE
    ) {
        return true
    }
    return false
}

export function isAdverb(wordPair: Pair): boolean {
    let currentPOS: number = wordPair.pos
    return (
        currentPOS === PartsOfSpeech.RB ||
        currentPOS === PartsOfSpeech.RBR ||
        currentPOS === PartsOfSpeech.RBS
    )
}

export function isPreposition(wordPair: Pair): boolean {
    let currentPOS: number = wordPair.pos
    return currentPOS === PartsOfSpeech.IN
}

export function isPredicate(
    wordPair: Pair,
    restOfSent: Pair[]
): boolean {

    let currentPOS: number = wordPair.pos

    if (
        currentPOS === PartsOfSpeech.VB ||
        currentPOS === PartsOfSpeech.VBD ||
        currentPOS === PartsOfSpeech.VBN ||
        currentPOS === PartsOfSpeech.VBP ||
        currentPOS === PartsOfSpeech.VBZ ||
        ((
            currentPOS === PartsOfSpeech.JJ ||
            currentPOS === PartsOfSpeech.JJR ||
            currentPOS === PartsOfSpeech.JJS
        ) && (
                restOfSent.length > 0 &&
                (
                    restOfSent[0].pos === PartsOfSpeech.NN ||
                    restOfSent[0].pos === PartsOfSpeech.NNS
                )
            ))
    ) {
        return true
    }
    return false
}

export function isConjunction(wordPair: Pair): boolean {
    let currentPOS: number = wordPair.pos
    let currentWord: string = wordPair.name

    return (
        (currentPOS === PartsOfSpeech.IN ||
            currentPOS === PartsOfSpeech.CC ||
            currentPOS === PartsOfSpeech.WR
        ) && (
            conjunctions.has(currentWord)
        )
    )
}

export function isRelativeClause(wordPair: Pair): boolean {
    return false
}

export function hasMultipleNouns(nounList: Noun[]): boolean {
    return nounList.length > 1
}

export function isObjectControl(matrixPred: Verb): boolean {
    return (
        Array
            .from(objectControlVerbs)
            .some(item => matrixPred
                .getName()
                .includes(item))
    )
}

export function isRaisingVerb(matrixPred: Verb): boolean {
    return (
        Array
            .from(raisingVerbs)
            .some(item => matrixPred
                .getName()
                .includes(item)
            )
    )
}

export function isECMVerb(matrixPred: Verb): boolean {
    return (
        Array
            .from(ecmVerbs)
            .some(item => matrixPred
                .getName()
                .includes(item)
            )
    )
}

export function addNounsToObjectControlPred(
    matrixClause: Clause,
    matrixPred: Verb,
    listOfNouns: Noun[]
): void {
    // Move first noun to matrix clause
    let matrixSubject: Noun = listOfNouns.shift() as Noun
    // Copy second noun to matrix clause
    let matrixObject: Noun = listOfNouns[0]
    matrixPred.addSubjectAndObject(matrixSubject, matrixObject)
    matrixClause.addNounToClause(matrixSubject)
    matrixClause.addNounToClause(matrixObject)
}

export function addNounsToSubjectControlPred(
    matrixClause: Clause,
    matrixPred: Verb,
    listOfNouns: Noun[]
): void {
    // Copy subject to matrix clause
    let matrixSubject: Noun = listOfNouns[0]
    // Move object to matrix clause
    let matrixObject: Noun = listOfNouns.pop() as Noun
    matrixPred.addSubjectAndObject(matrixSubject, matrixObject)
    matrixClause.addNounToClause(matrixSubject)
    matrixClause.addNounToClause(matrixObject)
}

export function uncontractVerbalModifiers(modifier: string): string[] {
    if (modifier === "didn't") {
        return ["did", "not"]
    } else {
        return [modifier]
    }
}

/**
   * should probably break this up into smaller functions
   */
export function fixPartsOfSpeech(
    pairedList: Pair[],
    // posList: number[],
    // wordList: string[]
): Pair[] {
    for (let i = 0; i < pairedList.length; i++) {
        if (
            (
                pairedList[i].name === "do" ||
                pairedList[i].name === "does" ||
                pairedList[i].name === "did"
            ) && (
                (
                    pairedList[i + 1].name === "n't" ||
                    pairedList[i + 1].name === "not"
                )
            )
        ) {
            pairedList[i].pos = PartsOfSpeech.TENSE
            if (pairedList[i + 1].name === "not") {
                pairedList[i + 1].pos = PartsOfSpeech.NEGATION
            }

        } else if ((
            pairedList[i].name === "have" ||
            pairedList[i].name === "has" ||
            pairedList[i].name === "had"
        ) && (
                pairedList[i + 1].pos === PartsOfSpeech.RB
            )
        ) {
            pairedList[i].pos = PartsOfSpeech.PERFECTIVE

        } else if (
            (
                pairedList[i].name === "have" ||
                pairedList[i].name === "has" ||
                pairedList[i].name === "had"
            ) && (
                pairedList[i + 1].pos == PartsOfSpeech.VBN
            )) {
            pairedList[i].pos = PartsOfSpeech.PERFECTIVE
        }

        if ((
            i === 0 && (
                pairedList[i].pos === PartsOfSpeech.VBD ||
                pairedList[i].pos === PartsOfSpeech.VBZ ||
                pairedList[i].pos === PartsOfSpeech.VBP ||
                pairedList[i].pos === PartsOfSpeech.MD ||
                pairedList[i].pos === PartsOfSpeech.TENSE
            )

        ) && (
                isNoun(
                    {
                        pos: pairedList[i + 1].pos,
                        name: pairedList[i + 1].name
                    }
                ) || (
                    isAdverb(
                        {
                            pos: pairedList[i + 1].pos,
                            name: pairedList[i + 1].name
                        }
                    )
                    &&
                    isNoun(
                        {
                            pos: pairedList[i + 2].pos,
                            name: pairedList[i + 2].name
                        }
                    )
                )
            )
        ) {
            pairedList[i].pos = PartsOfSpeech.QuestionTense
        } else if (
            (
                pairedList[i].name === "make" ||
                pairedList[i].name === "made" ||
                pairedList[i].name === "let"
            ) && (
                pairedList
                    .slice(i)
                    .some(item => item.pos === PartsOfSpeech.VB)
            )
        ) {
            pairedList[i].pos = PartsOfSpeech.CAUSATIVE
        }
    }
    return pairedList
}

export function addCaustiveModifier(
    agentNoun: Noun,
    causativePair: Pair
): Noun {
    agentNoun.addModifier(causativePair.name)
    return agentNoun
}