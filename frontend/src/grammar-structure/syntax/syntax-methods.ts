import type { Word } from "../types/word"
import { Noun } from "./parts-of-speech/noun"
import { Verb } from "./parts-of-speech/verb"
import {
    ditransitiveList,
    ecmVerbs, objectControlVerbs, PartsOfSpeech,
    raisingVerbs
} from "./syntax-constants"
import { Mod } from "./mod"
import { Predicate } from "./predicate"
import type { WordBuilder } from "../builders/word-builder"
import type { PredicateBuilder } from "../builders/predicate-builder"
import { Preposition } from "./parts-of-speech/preposition"


export function getLexicalizedMod(adjWord: Word): Mod | undefined {
    if (adjWord.pos === PartsOfSpeech.JJS) {

        const superlative = new Mod(
            {
                name: "superlative",
                pos: PartsOfSpeech.SUPERLATIVE
            }
        )
        return superlative

    } else if (adjWord.pos === PartsOfSpeech.JJR) {

        const comparative = new Mod(
            {
                name: "comparative",
                pos: PartsOfSpeech.COMPARATIVE
            }
        )
        return comparative
    }
    return undefined
}

export function addStrandedPassive(wordList: Word[], nounStack: Noun[]): void {
    const passiveWord = wordList.shift() as Word
    const passiveMod = new Mod(passiveWord)

    const relNoun = nounStack.find(
        noun => noun.getName() === "that"
    )

    if (relNoun) {
        relNoun.addModifier(passiveMod)
    }
}

export function getBy(bList: WordBuilder[], stack: Noun[]): void {
    const index = bList
        .findIndex(builder => builder.getModStack()
            .some(mod => mod.getName() === "by")
        )
    if (index === -1) return

    const builder = bList[index]
    const mod = builder.getModStack().find(
        mod => mod.getName() === "by"
    )
    if (!mod) return

    bList = bList.splice(index, 1)

    const nPhrase = stack[0]
    nPhrase.addModifier(mod)
}

// export function handleFocusElement(wordList: Word[]): void {
//     const focusWord: Word = wordList.shift() as Word
//     const focusMod: Mod = new Mod(focusWord)
//     if (focusElement.pos === PartsOfSpeech.QuestionTense)
//         console.log(`Here I am, once again, I'm falling to pieces: 
//                     ${focusElement.name}`
//         )
// }

export function isInfAgr(predWord: Word): boolean {
    return predWord.pos === PartsOfSpeech.InfAgr
}

export function isAdjunctRel(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.WR ||
        (
            word.pos === PartsOfSpeech.WDT &&
            word.name === "which"
        )
    )
}

export function isAdverb(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.RB ||
        word.pos === PartsOfSpeech.RBR ||
        word.pos === PartsOfSpeech.RBS
    )
}

export function isAdjective(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.JJ ||
        word.pos === PartsOfSpeech.JJR ||
        word.pos === PartsOfSpeech.JJS
    )
}

export function isAdjectiveAgr(word: Word): boolean {
    return word.pos === PartsOfSpeech.AdvAgr
}

export function isAdjectiveMod(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.SUPERLATIVE ||
        word.pos === PartsOfSpeech.COMPARATIVE
    )
}

export function isBeVerb(verbName: string): boolean {
    return (
        verbName === "am" ||
        verbName === "are" ||
        verbName === "is" ||
        verbName === "was" ||
        verbName === "were" ||
        verbName === "been" ||
        verbName === "be" ||
        verbName === "being"
    )
}

export function isCausative(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.CAUSATIVE
    )
}

export function isConjunction(word: Word): boolean {
    const currentPOS = word.pos
    // const currentWord: string = word.name

    return (
        (currentPOS === PartsOfSpeech.IN ||
            currentPOS === PartsOfSpeech.CC ||
            currentPOS === PartsOfSpeech.WR
        )
        // && (
        //     conjunctions.has(currentWord)
        // )
    )
}

export function isDitransitive(predicate: Predicate): boolean {
    const verb = predicate.getSemanticContent()
    if (!(verb instanceof Verb)) return false
    const name = verb.getName()
    return ditransitiveList.includes(name)
}

export function isECMPred(pred: Predicate): boolean {
    const sCont = pred.getSemanticContent()
    if (!(sCont instanceof Verb)) return false
    return (
        ecmVerbs.some(
            raisingVerb => sCont
                .getName()
                .includes(raisingVerb)
        )
    )
}

export function isFocusElement(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.QTense
    )
}

export function isIngVerb(word: Word): boolean {
    return word.pos === PartsOfSpeech.VBG
}

export function isNominal(word: Word): boolean {
    return isNoun(word) || isNounMod(word)
}

export function isNoun(word: Word): boolean {
    const currentPOS = word.pos
    return (currentPOS === PartsOfSpeech.NN ||
        currentPOS === PartsOfSpeech.NNS ||
        currentPOS === PartsOfSpeech.NNP ||
        currentPOS === PartsOfSpeech.NNPS ||
        currentPOS === PartsOfSpeech.PRP ||
        currentPOS === PartsOfSpeech.FW
    )
}

export function isNounMod(
    word: Word,
    // restOfSent: Word[]
): boolean {
    const currentPOS = word.pos
    return (
        currentPOS === PartsOfSpeech.DT ||
        currentPOS === PartsOfSpeech.PRPQ ||
        currentPOS === PartsOfSpeech.PASSIVE
        //  ||
        // (
        //     currentPOS === PartsOfSpeech.NNP &&
        //     restOfSent[0].pos === PartsOfSpeech.NN
        // )
    )
}

export function isNounPred(pred: Predicate): boolean {
    const content = pred.getSemanticContent()
    return content instanceof Noun
}

export function isPrepPred(pred: Predicate): boolean {
    const content = pred.getSemanticContent()
    return content instanceof Preposition
}

export function isObjectControlPred(pred: Predicate): boolean {
    const sCont = pred.getSemanticContent()
    if (!(sCont instanceof Verb)) return false
    return (
        objectControlVerbs.some(
            raisingVerb => sCont
                .getName()
                .includes(raisingVerb)
        )
    )
}

export function isPassive(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.PASSIVE
    )
}

export function isPredicate(word: Word, restOfSent: Word[]): boolean {

    const currentPOS = word.pos
    return (
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
    )
}

export function isPreposition(word: Word): boolean {
    return word.pos === PartsOfSpeech.IN
}

export function isRaisingPred(pred: Predicate): boolean {
    const sCont = pred.getSemanticContent()
    if (!(sCont instanceof Verb)) return false
    return (
        raisingVerbs.some(
            raisingVerb => sCont
                .getName()
                .includes(raisingVerb)
        )
    )
}

export function isRelative(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.WDT ||
        word.pos === PartsOfSpeech.WP ||
        word.pos === PartsOfSpeech.WPQ
    )
}

export function isTensedVerb(word: Word): boolean {
    if (!isVerb(word)) return false
    const pos = word.pos
    return (
        pos === PartsOfSpeech.VBD
        || pos === PartsOfSpeech.VBZ
    )
}

export function isVerb(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.VB ||
        word.pos === PartsOfSpeech.VBD ||
        word.pos === PartsOfSpeech.VBN ||
        word.pos === PartsOfSpeech.VBP ||
        word.pos === PartsOfSpeech.VBZ
    )
}

export function isVerbAgr(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.PsvAgr ||
        word.pos === PartsOfSpeech.InfAgr ||
        word.pos === PartsOfSpeech.TO
    )
}

export function isVerbMod(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.TENSE ||
        word.pos === PartsOfSpeech.PERFECTIVE ||
        word.pos === PartsOfSpeech.NEGATION ||
        word.pos === PartsOfSpeech.MD ||
        word.pos === PartsOfSpeech.CAUSATIVE ||
        word.pos === PartsOfSpeech.QTense ||
        word.pos === PartsOfSpeech.PRESENT ||
        word.pos === PartsOfSpeech.PAST
    )
}

export function isWHNounRel(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.WP
        && (
            word.name === "who"
            || word.name === "what"
        )
    )
}

export function modStackContainsCaus(modStack: Mod[]): boolean {
    return (
        modStack.some(
            mod => mod.getPos() === PartsOfSpeech.CAUSATIVE
        )
    )
}

export function passiveByPhraseIndex(wordList: Word[]): number {
    let index = wordList.length - 1
    while (index >= 0) {
        if (wordList[index].name === "by") {
            return index
        }
        index -= 1
    }
    return index
}

export function uncontractVerbalModifiers(modifier: Mod): Mod[] {
    if (modifier.getName() === "didn't") {
        return [
            new Mod(
                {
                    name: "did",
                    pos: PartsOfSpeech.TENSE

                }
            ),
            new Mod(
                {
                    name: "not",
                    pos: PartsOfSpeech.NEGATION
                }
            )
        ]
    } else {
        return [modifier]
    }
}

export function getVerbFromTense(pBuilder: PredicateBuilder): Verb | undefined {
    const tMod = pBuilder.getModStack().find(
        mod => (
            mod.getName() === "do" ||
            mod.getName() === "did"
        )
    )
    if (!tMod) return undefined

    pBuilder.removeMod(tMod)
    const verb = new Verb(tMod.getName())
    return verb
}

export function isWHWord(name: string): boolean {
    const whWords = [
        "who",
        "what",
        "where",
        "why",
        "when",
        "how"
    ]
    return whWords.includes(name)
}