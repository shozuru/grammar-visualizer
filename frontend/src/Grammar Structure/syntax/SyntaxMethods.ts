import type { Word } from "../types/Word"
import { Noun } from "./partsOfSpeech/Noun"
import { Verb } from "./partsOfSpeech/Verb"
import {
    ditransitiveList,
    ecmVerbs, objectControlVerbs, PartsOfSpeech,
    raisingVerbs
} from "./SyntaxConstants"
import { Mod } from "./Mod"
import { Predicate } from "./Predicate"
import type { Phrase } from "./partsOfSpeech/Phrase"
import type { WordBuilder } from "../Builders/WordBuilder"


export function getLexicalizedMod(adjWord: Word): Mod | null {
    if (adjWord.pos === PartsOfSpeech.JJS) {

        const superlative: Mod = new Mod(
            {
                name: "superlative",
                pos: PartsOfSpeech.SUPERLATIVE
            }
        )
        return superlative

    } else if (adjWord.pos === PartsOfSpeech.JJR) {

        const comparative: Mod = new Mod(
            {
                name: "comparative",
                pos: PartsOfSpeech.COMPARATIVE
            }
        )
        return comparative
    }
    return null
}

export function addStrandedPassive(wordList: Word[], nounStack: Noun[]): void {
    const passiveWord: Word = wordList.shift() as Word
    const passiveMod: Mod = new Mod(passiveWord)

    const relNoun: Noun | undefined = nounStack.find(
        noun => noun.getName() === "that"
    )

    if (relNoun) {
        relNoun.addModifier(passiveMod)
    }
}

export function getBy(bList: WordBuilder[], stack: Noun[]): void {
    const index: number = bList
        .findIndex(builder => builder.getModStack()
            .some(mod => mod.getName() === "by")
        )
    if (index === -1) return

    const builder: WordBuilder = bList[index]
    const mod: Mod | undefined = builder.getModStack().find(
        mod => mod.getName() === "by"
    )
    if (!mod) return

    bList = bList.splice(index, 1)

    const nPhrase: Noun = stack[0]
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
    const currentPOS: number = word.pos
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
    const verb: Phrase | null = predicate.getSemanticContent()
    if (!(verb instanceof Verb)) return false
    const name: string = verb.getName()
    return ditransitiveList.includes(name)
}

export function isECMPred(pred: Predicate): boolean {
    const sCont: Phrase | null = pred.getSemanticContent()
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

export function isNoun(word: Word): boolean {
    const currentPOS: number = word.pos
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
    const currentPOS: number = word.pos
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

export function isObjectControlPred(pred: Predicate): boolean {
    const sCont: Phrase | null = pred.getSemanticContent()
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

    const currentPOS: number = word.pos
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
    const sCont: Phrase | null = pred.getSemanticContent()
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
        word.pos === PartsOfSpeech.QTense
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
    let index: number = wordList.length - 1
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