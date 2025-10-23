import type { Pair } from "../GrammarVisualizer/Pair"
import { conjunctions, PartsOfSpeech } from "../SyntaxConstants"

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
    return false
}

export function isNounModifier(wordPair: Pair): boolean {
    let currentPOS: number = wordPair.pos
    return (
        currentPOS === PartsOfSpeech.DT ||
        currentPOS === PartsOfSpeech.PRPQ
    )
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