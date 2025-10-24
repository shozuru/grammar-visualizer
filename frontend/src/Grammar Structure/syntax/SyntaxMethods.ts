import type { Pair } from "../types/Pair"
import { Noun } from "./partsOfSpeech/Noun"
import type { Verb } from "./partsOfSpeech/Verb"
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
    matrixPred: Verb, listOfNouns: Noun[]
): void {
    // Matrix subject is first noun argument
    let matrixSubject: Noun = listOfNouns.shift() as Noun
    // Matrix object is second noun argument
    let matrixObject: Noun = listOfNouns[0]
    matrixPred.addSubjectAndObject(matrixSubject, matrixObject)
}

export function addNounsToSubjectControlPred(
    matrixPred: Verb, listOfNouns: Noun[]
): void {
    // Add subject to matrix clause
    let matrixSubject: Noun = listOfNouns[0]
    // add object to matrix clause
    let matrixObject: Noun = listOfNouns.pop() as Noun
    matrixPred.addSubjectAndObject(matrixSubject, matrixObject)
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
    posList: number[],
    wordList: string[]
): number[] {
    for (let i = 0; i < wordList.length; i++) {
        if (
            (
                wordList[i] === "do" ||
                wordList[i] === "does" ||
                wordList[i] === "did"
            ) && (
                (
                    wordList[i + 1] === "n't" ||
                    wordList[i + 1] === "not"
                )
            )
        ) {
            posList[i] = PartsOfSpeech.TENSE
            if (wordList[i + 1] === "not") {
                posList[i + 1] = PartsOfSpeech.NEGATION
            }

        } else if ((
            wordList[i] === "have" ||
            wordList[i] === "has" ||
            wordList[i] === "had"
        ) && (
                posList[i + 1] === PartsOfSpeech.RB
            )
        ) {
            posList[i] = PartsOfSpeech.PERFECTIVE

        } else if (
            (
                wordList[i] === "have" ||
                wordList[i] === "has" ||
                wordList[i] === "had"
            ) && (
                posList[i + 1] == PartsOfSpeech.VBN
            )) {
            posList[i] = PartsOfSpeech.PERFECTIVE
        }

        if ((
            i === 0 && (
                posList[i] === PartsOfSpeech.VBD ||
                posList[i] === PartsOfSpeech.VBZ ||
                posList[i] === PartsOfSpeech.VBP ||
                posList[i] === PartsOfSpeech.MD ||
                posList[i] === PartsOfSpeech.TENSE
            )

        ) && (
                isNoun({ pos: posList[i + 1], name: wordList[i + 1] }) ||
                (
                    isAdverb({ pos: posList[i + 1], name: wordList[i + 1] })
                    &&
                    isNoun({ pos: posList[i + 2], name: wordList[i + 2] })
                )
            )
        ) {
            posList[i] = PartsOfSpeech.QuestionTense
        } else if (
            (
                wordList[i] === "make" ||
                wordList[i] === "made" ||
                wordList[i] === "let"
            ) && (
                posList
                    .slice(i)
                    .includes(PartsOfSpeech.VB)
            )
        ) {
            posList[i] = PartsOfSpeech.CAUSATIVE
        }
    }
    return posList
}

export function addCaustiveModifier(
    agentNoun: Noun,
    causativePair: Pair
): Noun {
    agentNoun.addModifier(causativePair.name)
    return agentNoun
}