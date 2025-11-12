import type { Word } from "../types/Word"
import { Noun } from "./partsOfSpeech/Noun"
import { Verb } from "./partsOfSpeech/Verb"
import { Preposition } from "./partsOfSpeech/Preposition"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Clause } from "./partsOfSpeech/Clause"
import {
    ecmVerbs, objectControlVerbs, PartsOfSpeech,
    raisingVerbs
} from "./SyntaxConstants"
import { Mod } from "./Mod"
import { Predicate } from "./Predicate"
import { ClauseBuilder } from "./ClauseBuilder"

export function addCaustiveModifier(
    agentNoun: Noun,
    causeWord: Word
): void {
    agentNoun.addModifier(new Mod(causeWord))
}

export function getLexicalizedMod(adjWord: Word): Mod | null {
    if (adjWord.pos === PartsOfSpeech.JJS) {

        let superlative: Mod = new Mod(
            {
                name: "superlative",
                pos: PartsOfSpeech.SUPERLATIVE
            }
        )
        return superlative

    } else if (adjWord.pos === PartsOfSpeech.JJR) {

        let comparative: Mod = new Mod(
            {
                name: "comparative",
                pos: PartsOfSpeech.COMPARATIVE
            }
        )
        return comparative
    }
    return null
}

export function addRelClauseToNounPhrase(
    wordList: Word[],
    nounModStack: Mod[]
): Clause {
    let relBeVerb: Verb = new Verb('BE')
    let relPred: Predicate = new Predicate(relBeVerb)

    let relPredWord = wordList[0]
    if (isAdverbElement(relPredWord)) {
        let AdverbWord: Word = wordList.shift() as Word
        let advPred: Adverb = new Adverb(AdverbWord.name)
        relPred.setSemanticElement(advPred)
    } else if (isPreposition(relPredWord)) {
        let pPred: Preposition = handlePrepositionPhrase(wordList)
        relPred.setSemanticElement(pPred)
    }

    let relClause: Clause = new Clause(relPred)

    let relWord: Word = { name: 'that', pos: PartsOfSpeech.WDT }
    let relNoun: Noun = new Noun(relWord.name)

    relClause.addNounToClause(relNoun)

    if (!nounModStack.some(mod => mod.getPos() === PartsOfSpeech.WDT)) {
        let relMod: Mod = new Mod(relWord)
        nounModStack.push(relMod)
    }
    return relClause
}

export function addRelClauseToSubject(
    subject: Noun,
    wordList: Word[]
): void {
    let relClauseWords: Word[] = removeRelClause(wordList)

    let relWord: Word = { name: "that", pos: PartsOfSpeech.WDT }
    let relNoun: Noun = new Noun(relWord.name)

    let relSentence: ClauseBuilder = new ClauseBuilder(relClauseWords)
    if (isNominalElement(relClauseWords)) {
        relSentence.getNounStack().push(relNoun)
    }
    else {
        relSentence.setCurrentSubject(relNoun)
    }
    relSentence.generateClauses()

    if (!subject
        .getModifiers()
        .some(mod =>
            mod.getPos() === PartsOfSpeech.WDT
        )) {
        let relMod: Mod = new Mod(relWord)
        subject.addModifier(relMod)
    }
}

export function addStrandedPassive(wordList: Word[], nounStack: Noun[]): void {
    let passiveWord: Word = wordList.shift() as Word
    let passiveMod: Mod = new Mod(passiveWord)

    let relNoun: Noun | undefined = nounStack.find(
        noun => noun.getName() === "that"
    )

    if (relNoun) {
        relNoun.addModifier(passiveMod)
    }
}

export function createNounPhrase(nounWord: Word, modifiers: Mod[]): Noun {
    let nounPhrase: Noun = new Noun(nounWord.name)
    while (modifiers.length > 0) {
        let mod: Mod = modifiers.pop() as Mod
        nounPhrase.addModifier(mod)
    }
    return nounPhrase
}

export function createRosClause(sentence: ClauseBuilder): {
    clause: Clause
    nextSubject: Noun | null
} {
    let clause = new Clause(sentence.getCurrentPredicate() as Predicate)
    clause.addNounToClause(sentence.getCurrentSubject() as Noun)
    for (let adjunct of sentence.getAdjunctStack()) {
        clause.addAdjunct(adjunct)
    }
    let nextSubject: Noun | null =
        handleRosObjects(clause, sentence.getWordList(), sentence)
    return { clause, nextSubject }
}

export function handleAdverbPhrase(
    sentence: ClauseBuilder
): Adverb | Preposition | Noun {
    let wordList: Word[] = sentence.getWordList()

    // handles adjective relative clauses like 'the clean room'
    if (wordList[1] && isNominalElement(wordList.slice(1))) {
        let nRelPhrase: Noun = handleNounPhrase(sentence)
        return nRelPhrase
    }
    return modPhrase
}

// export function handleFocusElement(wordList: Word[]): void {
//     let focusWord: Word = wordList.shift() as Word
//     let focusMod: Mod = new Mod(focusWord)
//     if (focusElement.pos === PartsOfSpeech.QuestionTense)
//         console.log(`Here I am, once again, I'm falling to pieces: 
//                     ${focusElement.name}`
//         )
// }

export function handleNounPhrase(
    sentence: ClauseBuilder
): Noun {
    let nounModStack: Mod[] = []
    let wordList: Word[] = sentence.getWordList()

    while (!isNoun(wordList[0])) {
        if (isAdverb(wordList[0])) {
            let relClause: Clause =
                addRelClauseToNounPhrase(wordList, nounModStack)
            sentence.addClausetoClauseList(relClause)
            sentence.incrementClauseCounter()
        }
    }

    let headWord: Word = wordList.shift() as Word
    if (
        wordList[0] &&
        isCausative(wordList[0])
    ) {
        let causeWord: Word = wordList.shift() as Word
        nounModStack.push(new Mod(causeWord))
    }
    if (
        wordList[0] &&
        isRelative(wordList[0])
    ) {
        nounModStack.push(new Mod(wordList[0]))
    }
    if (
        wordList[0] &&
        isPreposition(wordList[0])
    ) {
        let relClause: Clause =
            addRelClauseToNounPhrase(wordList, nounModStack)
        sentence.addClausetoClauseList(relClause)
        sentence.incrementClauseCounter()
    }
    return createNounPhrase(headWord, nounModStack)
}

export function handlePredicatePhrase(sentence: ClauseBuilder): Noun | null {
    let experiencer: Noun | null = null
    let wordList: Word[] = sentence.getWordList()
    while (!isVerb(wordList[0])) {
        if (
            sentence.getCurrentSubject() instanceof Noun &&
            isCausative(wordList[0])
        ) {
            // I [made] her go to the park
            let causMod: Mod = new Mod(wordList.shift() as Word)
            let subject: Noun = sentence.getCurrentSubject() as Noun
            subject.addModifier(causMod)
        } else if (isNominalElement(wordList)) {
            // I made [her] go to the park
            experiencer = handleNounPhrase(sentence)
        }
    }
    return experiencer
}

export function createRelativeNoun(wordList: Word[]): Noun {
    let relWord: Word = wordList.shift() as Word
    let relNoun: Noun = new Noun(relWord.name)
    if (
        wordList[0] &&
        isCausative(wordList[0])
    ) {
        let causeWord: Word = wordList.shift() as Word
        let cuaseMod: Mod = new Mod(causeWord)
        relNoun.addModifier(cuaseMod)
    }
    return relNoun
}

export function handleRosObjects(
    rosClause: Clause,
    wordList: Word[],
    sentence: ClauseBuilder
): Noun | null {

    if (isNominalElement(wordList)) {
        let nPhrase: Noun = handleNounPhrase(sentence)

        if (isObjectControlPred(rosClause.getPredicate())) {
            rosClause.addNounToClause(nPhrase)
        }
        return nPhrase
    }
    return null
}

export function isAdverb(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.RB ||
        word.pos === PartsOfSpeech.RBR ||
        word.pos === PartsOfSpeech.RBS
    )
}

export function isAdjectigve(word: Word): boolean {
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

// export function isConjunction(word: Word): boolean {
//     let currentPOS: number = word.pos
//     let currentWord: string = word.name

//     return (
//         (currentPOS === PartsOfSpeech.IN ||
//             currentPOS === PartsOfSpeech.CC ||
//             currentPOS === PartsOfSpeech.WR
//         ) && (
//             conjunctions.has(currentWord)
//         )
//     )
// }

export function isECMPred(pred: Predicate): boolean {
    return (
        ecmVerbs.some(ecmVerb => pred
            .getVerb()
            .getName()
            .includes(ecmVerb)
        )
    )
}

export function isFocusElement(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.QuestionTense
    )
}

export function isNominalElement(wordList: Word[]): boolean {
    return (
        wordList[0] &&
        (
            isNoun(wordList[0]) ||
            isNounModifier(wordList[0], wordList.slice(1))
        )
    )
}

export function isNoun(word: Word): boolean {
    let currentPOS: number = word.pos
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
    let currentPOS: number = word.pos
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

export function isObjectControlPred(pred: Predicate): boolean {
    return (
        objectControlVerbs.some(
            objectVerb => pred
                .getVerb()
                .getName()
                .includes(objectVerb)
        )
    )
}

export function isPassive(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.PASSIVE
    )
}

export function isPredicate(word: Word, restOfSent: Word[]): boolean {

    let currentPOS: number = word.pos
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
    return (
        raisingVerbs.some(
            raisingVerb => pred
                .getVerb()
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

export function isRosCondition(
    predicate: Predicate,
    wordList: Word[]
): boolean {
    let i: number = 0
    while (
        wordList[i] &&
        !isVerb(wordList[i]) &&
        wordList[i].pos !== PartsOfSpeech.TO
    ) {
        i += 1
    }
    if (
        wordList[i] &&
        wordList[i].pos === PartsOfSpeech.TO &&
        isRosVerb(predicate)
    ) {
        return true
    }
    return false
}

export function isRosVerb(pred: Predicate): boolean {
    return (
        isRaisingPred(pred) ||
        isObjectControlPred(pred) ||
        isECMPred(pred)
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
        word.pos === PartsOfSpeech.MD
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

    // if (!isNoun(wordList[index])) {
    //     return null
    // }
    // index -= 1
    while (index >= 0) {
        if (wordList[index].name === "by") {
            return index
        }
        index -= 1
    }
    return index
}

export function removeRelClause(wordList: Word[]): Word[] {
    let index: number = 0
    let verbCounter: number = 0
    while (
        wordList[index] &&
        verbCounter < 2
    ) {
        if (isVerbalElement(wordList[index])) {
            verbCounter += 1
        }
        index += 1
    }
    return wordList.splice(0, index - 1)
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