import type { Pair } from "../types/Pair"
import { Noun } from "./partsOfSpeech/Noun"
import { Verb } from "./partsOfSpeech/Verb"
import { Preposition } from "./partsOfSpeech/Preposition"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Clause } from "./partsOfSpeech/Clause"
import {
    conjunctions, ecmVerbs, objectControlVerbs, PartsOfSpeech,
    raisingVerbs
} from "./SyntaxConstants"
import { Mod } from "./Mod"
import { Agr } from "./Agr"
import { Predicate } from "./Predicate"
import { Relativize } from "./Relativize"


export function addAdverbModsAndArgs(
    adverb: Adverb,
    adverbModStack: Mod[],
    adverbAgrStack: Agr[]
): void {
    if (
        adverbModStack.length > 0
    ) {
        for (const modifier of adverbModStack) {
            adverb.addModifier(modifier)
        }
    }
    if (
        adverbAgrStack.length > 0
    ) {
        for (const agr of adverbAgrStack) {
            adverb.addAdverbAgr(agr)
        }
    }
}

export function addCaustiveModifier(
    agentNoun: Noun,
    causativePair: Pair
): Noun {
    agentNoun.addModifier(new Mod(causativePair))
    return agentNoun
}

export function addClauseArgumentsAndAdjuncts(
    relClause: Clause,
    listOfPairs: Pair[]
): void {
    // gets clause arguments and modifiers and adds them to the clause

    let nounModStack: Mod[] = []
    let adverbModStack: Mod[] = []
    let adverbAgrStack: Agr[] = []

    while (listOfPairs[0] && !isVerbalElement(listOfPairs[0])) {

        let currentWPair: Pair = listOfPairs.shift() as Pair

        // this part is literally the same as in the main sentence method i feel
        // like we need to move stuff so that we can just reuse the same code

        if (isNounModifier(currentWPair, listOfPairs)) {
            nounModStack.push(new Mod(currentWPair))
        } else if (isAdverbMod(currentWPair)) {
            adverbModStack.push(new Mod(currentWPair))
        } else if (isAdverbAgr(currentWPair)) {
            adverbAgrStack.push(new Agr(currentWPair))
        }

        // else if (
        //     this.nounStack.length > 0 &&
        //     isCausative(currentPair)
        // ) {
        //     let agentNoun: Noun = this.nounStack.pop() as Noun
        //     this.nounStack.push(
        //         addCaustiveModifier(agentNoun, currentPair)
        //     )
        // } 

        else if (
            isPassive(currentWPair)
        ) {
            nounModStack.push(new Mod(currentWPair))
        }
        else if (isNoun(currentWPair)) {
            let nPhrase: Noun = createNounPhrase(
                currentWPair,
                nounModStack
            )
            addPhraseToClause(nPhrase, relClause)

        } else if (isAdverb(currentWPair)) {
            let aPhrase: Adverb = new Adverb(currentWPair.name)
            addAdverbModsAndArgs(aPhrase, adverbModStack, adverbAgrStack)

            let modPhrase: Adverb | Preposition =
                resolveAdverbAttachment(aPhrase, listOfPairs)
            addPhraseToClause(modPhrase, relClause)

        } else if (isPreposition(currentWPair)) {
            let pPhrase: Preposition = new Preposition(currentWPair.name)
            addPhraseToClause(pPhrase, relClause)
        }
        if (nounModStack.length > 0 &&
            nounModStack[0].getName() === "by"
        ) {
            relClause
                .getNouns()
                .forEach(noun => {
                    if (noun.getName() === "that") {
                        let passiveMod: Mod = nounModStack.shift() as Mod
                        noun.addModifier(passiveMod)
                    }
                })
        }
    }
}

export function addMatrixClauseArguments(
    matrixPredicate: Predicate,
    nounArguments: Noun[]
): Clause {

    let matrixClause: Clause = new Clause(matrixPredicate)
    if (
        nounArguments[0]
            .getModifiers()
            .some(mod =>
                mod.getName() === "make" ||
                mod.getName() === "made" ||
                mod.getName() === "let"
            )
    ) {
        let agentNoun: Noun = nounArguments.shift() as Noun
        matrixClause.setCausativeNoun(agentNoun)
    }

    if (
        hasMultipleNouns(nounArguments) &&
        (
            // I expected him to win
            isRaisingVerb(matrixPredicate.getVerb()) ||
            // I saw him win
            isECMVerb(matrixPredicate.getVerb())
        )
    ) {
        // move first noun to matrix clause
        let matrixSubject: Noun = nounArguments.shift() as Noun
        matrixClause.addNounToClause(matrixSubject)
    } else if (
        // I asked him to win
        hasMultipleNouns(nounArguments) &&
        isObjectControl(matrixPredicate.getVerb())
    ) {
        addNounsToObjectControlPred(matrixClause, nounArguments)
    } else if (
        // I used him to win
        hasMultipleNouns(nounArguments)
    ) {
        addNounsToSubjectControlPred(matrixClause, nounArguments)
    } else if (
        matrixClause
            .getPredAgrs()
            .some((pair) => pair.getPos() === PartsOfSpeech.PsvAgr)
    ) {
        let matrixSubject: Noun = nounArguments.shift() as Noun
        matrixClause.addNounToClause(matrixSubject)

    } else {
        // copy subject to matrix clause
        let matrixSubject: Noun = nounArguments[0]
        matrixClause.addNounToClause(matrixSubject)
    }
    return matrixClause
}

export function addMatrixClauseMods(
    matrixPred: Predicate, listOfMods: Mod[]
): void {
    while (listOfMods.length > 0) {
        let mod: Mod = listOfMods.shift() as Mod
        matrixPred.addMod(mod)
    }
}

// export function addMatrixClauseModifiers(
//     matrixPred: Verb, listOfTamms: Pair[]
// ): void {
//     while (listOfTamms.length > 0) {
//         let tammPair: Pair = listOfTamms.shift() as Pair
//         matrixPred.addMod(new Mod(tammPair))
//     }
// }

export function addNounsToObjectControlPred(
    matrixClause: Clause,
    listOfNouns: Noun[]
): void {
    // Move first noun to matrix clause
    let matrixSubject: Noun = listOfNouns.shift() as Noun
    // Copy second noun to matrix clause
    let matrixObject: Noun = listOfNouns[0]
    matrixClause.addNounToClause(matrixSubject)
    matrixClause.addNounToClause(matrixObject)
}

export function addNounsToSubjectControlPred(
    matrixClause: Clause,
    listOfNouns: Noun[]
): void {
    // Copy subject to matrix clause
    let matrixSubject: Noun = listOfNouns[0]
    // Move object to matrix clause
    let matrixObject: Noun = listOfNouns.pop() as Noun
    matrixClause.addNounToClause(matrixSubject)
    matrixClause.addNounToClause(matrixObject)
}

export function addPhraseToClause(
    phrase: Noun | Preposition | Adverb,
    clause: Clause
): void {
    if (isBeVerb(clause
        .getPredicate()
        .getVerb()
        .getName()
    )) {
        clause
            .getPredicate()
            .setSemanticElement(phrase)
    } else if (phrase instanceof Noun) {
        clause.addNounToClause(phrase)
    } else {
        clause.addAdjunct(phrase)
    }
}

export function createNounPhrase(nounPair: Pair, modifiers: Mod[]): Noun {
    let nounPhrase: Noun = new Noun(nounPair.name)
    while (modifiers.length > 0) {
        let mod: Mod = modifiers.pop() as Mod
        nounPhrase.addModifier(mod)
    }
    return nounPhrase
}

export function createPrepositionalPhrase(
    prepositionPair: Pair,
    restOfSent: Pair[]
): Preposition {
    let prepositionalPhrase: Preposition =
        new Preposition(prepositionPair.name)
    prepositionalPhrase.tagIfObject(restOfSent)

    return prepositionalPhrase
}

export function createRel(listOfPairs: Pair[], noun: Noun): Clause | null {
    let relPair: Pair = listOfPairs.shift() as Pair
    let relSystem: Relativize = new Relativize(relPair.name)
    noun.setRelativizer(relSystem)

    let relNoun: Noun = new Noun(relSystem.getName())
    console.log(noun)

    let relClause: Clause | null = createRelClause(relNoun, listOfPairs)
    return relClause
}

export function createRelClause(
    relNoun: Noun,
    listOfPairs: Pair[]
): Clause | null {

    let relClauseSubject: Noun | null = null

    if (isNominalElement(listOfPairs[0], listOfPairs.slice(1))) {
        let nounModStack: Mod[] = []

        while (!isNoun(listOfPairs[0])) {
            if (isNounModifier(listOfPairs[0], listOfPairs.slice(1))) {
                let nounModPair: Pair = listOfPairs.shift() as Pair
                let nounMod: Mod = new Mod(nounModPair)
                nounModStack.push(nounMod)
            }
        }
        let relSubPair: Pair = listOfPairs.shift() as Pair
        relClauseSubject = createNounPhrase(
            relSubPair,
            nounModStack
        )
    }
    console.log("I am drawing such a line")
    console.log(relClauseSubject)
    console.log(listOfPairs)

    if (isVerbalElement(listOfPairs[0])) {

        let verbModStack: Mod[] = []
        let verbAgrStack: Agr[] = []

        while (!isVerb(listOfPairs[0])) {
            if (isVerbModifier(listOfPairs[0])) {
                let verbModPair: Pair = listOfPairs.shift() as Pair
                let verbMod: Mod = new Mod(verbModPair)
                verbModStack.push(verbMod)
            } else {
                let verbAgrPair: Pair = listOfPairs.shift() as Pair
                let verbAgr: Agr = new Agr(verbAgrPair)
                verbAgrStack.push(verbAgr)
            }
        }

        if (isVerb(listOfPairs[0])) {
            // add predicate to relative clause
            let relVerbPair: Pair = listOfPairs.shift() as Pair
            let relVerb: Verb = new Verb(relVerbPair.name)

            let relPred: Predicate = new Predicate(relVerb)
            // add mods and agrs
            for (let mod of verbModStack) {
                relPred.addMod(mod)
            }
            for (let agr of verbAgrStack) {
                relPred.addAgr(agr)
            }
            let relClause: Clause = new Clause(relPred)
            if (relClauseSubject !== null) {
                relClause.addNounToClause(relClauseSubject)
            }
            relClause.addNounToClause(relNoun)

            addClauseArgumentsAndAdjuncts(relClause, listOfPairs)
            return relClause
        }
    }
    return null
}

/**
   * should probably break this up into smaller functions
   */
export function fixPartsOfSpeech(pairedList: Pair[]): Pair[] {
    for (let i = 0; i < pairedList.length; i++) {
        if (
            (
                pairedList[i].name === "don't" ||
                pairedList[i].name === "doesn't" ||
                pairedList[i].name === "didn't"
            ) && (
                pairedList[i].pos === PartsOfSpeech.RB
            )
        ) {
            pairedList[i].pos = PartsOfSpeech.NEGATION

        } else if (
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
        } else if (
            isBeVerb(pairedList[i].name) &&
            pairedList[i + 1].pos === PartsOfSpeech.VBN
        ) {
            pairedList[i].pos = PartsOfSpeech.PsvAgr

            let index: number =
                passiveByPhraseIndex(pairedList.slice(i))

            if (index >= 0) {
                pairedList[i + index].pos = PartsOfSpeech.PASSIVE
            }
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
        } else if (
            pairedList[i].pos === PartsOfSpeech.DT &&
            (
                pairedList[i + 1].pos === PartsOfSpeech.RBS ||
                pairedList[i + 1].pos === PartsOfSpeech.JJS
            )
        ) {
            pairedList[i].pos = PartsOfSpeech.AdvAgr
            if (pairedList[i + 1].name === "most") {
                pairedList[i + 1].pos = PartsOfSpeech.SUPERLATIVE
            }
        } else if (
            pairedList[i].pos === PartsOfSpeech.SUPERLATIVE &&
            pairedList[i + 1].pos === PartsOfSpeech.NN
        ) {
            pairedList[i + 1].pos = PartsOfSpeech.RB
        } else if (
            pairedList[i].pos === PartsOfSpeech.TO &&
            pairedList[i].name === "to"
        ) {
            pairedList[i].pos = PartsOfSpeech.InfAgr
        } else if (
            pairedList[i].pos === PartsOfSpeech.JJ
        ) {
            pairedList[i].pos = PartsOfSpeech.RB
        } else if (
            pairedList[i].pos === PartsOfSpeech.JJR
        ) {
            pairedList[i].pos = PartsOfSpeech.RBR
        } else if (
            pairedList[i].pos === PartsOfSpeech.JJS
        ) {
            pairedList[i].pos = PartsOfSpeech.RBS
        } else if (
            pairedList[i].pos === PartsOfSpeech.RB &&
            pairedList[i].name === "not"
        ) {
            pairedList[i].pos = PartsOfSpeech.NEGATION
        } else if (
            pairedList[i].pos === PartsOfSpeech.DT &&
            isVerb(pairedList[i + 1])
        ) {
            pairedList[i].pos = PartsOfSpeech.PRP
        }
    }
    return pairedList
}

export function hasMultipleNouns(nounList: Noun[]): boolean {
    return nounList.length > 1
}

export function isAdverb(wordPair: Pair): boolean {
    return (
        wordPair.pos === PartsOfSpeech.RB ||
        wordPair.pos === PartsOfSpeech.RBR ||
        wordPair.pos === PartsOfSpeech.RBS
    )
}

export function isAdverbAgr(wordPair: Pair): boolean {
    return wordPair.pos === PartsOfSpeech.AdvAgr
}

export function isAdverbMod(wordPair: Pair): boolean {
    return wordPair.pos === PartsOfSpeech.SUPERLATIVE
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

export function isCausative(wordPair: Pair): boolean {
    if (
        wordPair.pos === PartsOfSpeech.CAUSATIVE
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

export function isNominalElement(wordPair: Pair, listOfPairs: Pair[]): boolean {
    return (
        isNoun(wordPair) ||
        isNounModifier(wordPair, listOfPairs)
    )
}

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

export function isNounModifier(wordPair: Pair, restOfSent: Pair[]): boolean {
    let currentPOS: number = wordPair.pos
    return (
        currentPOS === PartsOfSpeech.DT ||
        currentPOS === PartsOfSpeech.PRPQ ||
        (
            currentPOS === PartsOfSpeech.NNP &&
            restOfSent[0].pos === PartsOfSpeech.NN
        )
    )
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

export function isPassive(wordPair: Pair): boolean {
    if (
        wordPair.pos === PartsOfSpeech.PASSIVE
    ) {
        return true
    }
    return false
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

export function isPreposition(wordPair: Pair): boolean {
    return wordPair.pos === PartsOfSpeech.IN
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

export function isRelative(wordPair: Pair): boolean {
    return (
        wordPair.pos === PartsOfSpeech.WDT
    )
}

export function isVerbAgr(wordPair: Pair): boolean {
    return (
        wordPair.pos === PartsOfSpeech.PsvAgr ||
        wordPair.pos === PartsOfSpeech.InfAgr ||
        wordPair.pos === PartsOfSpeech.TO
    )
}

export function isVerbalElement(wordPair: Pair): boolean {
    return (
        isVerb(wordPair) ||
        isVerbAgr(wordPair) ||
        isVerbModifier(wordPair)
    )
}

export function isVerb(wordPair: Pair): boolean {
    return (
        wordPair.pos === PartsOfSpeech.VB ||
        wordPair.pos === PartsOfSpeech.VBD ||
        wordPair.pos === PartsOfSpeech.VBN ||
        wordPair.pos === PartsOfSpeech.VBP ||
        wordPair.pos === PartsOfSpeech.VBZ
    )
}

export function isVerbModifier(wordPair: Pair): boolean {
    return (
        wordPair.pos === PartsOfSpeech.TENSE ||
        wordPair.pos === PartsOfSpeech.PERFECTIVE ||
        wordPair.pos === PartsOfSpeech.NEGATION ||
        wordPair.pos === PartsOfSpeech.QuestionTense ||
        wordPair.pos === PartsOfSpeech.MD
    )
}

export function passiveByPhraseIndex(
    listOfPairs: Pair[]

): number {
    let index: number = listOfPairs.length - 1

    // if (!isNoun(listOfPairs[index])) {
    //     return null
    // }
    // index -= 1
    while (index >= 0) {
        if (listOfPairs[index].name === "by") {
            return index
        }
        index -= 1
    }
    return index
}

export function removeAgr(verbAgrStack: Agr[], agrPos: PartsOfSpeech) {
    for (let i = 0; i < verbAgrStack.length; i++) {
        if (verbAgrStack[i].getPos() === agrPos) {
            return verbAgrStack.splice(i, 1)[0]
        }
    }
    return null
}

export function resolveAdverbAttachment(
    thisAdverb: Adverb,
    listOfNextWords: Pair[]
): Preposition | Adverb {

    // let thisAdverb: Adverb = new Adverb(firstarg.name)
    let nextWord: Pair = listOfNextWords[0]

    if (nextWord && isPreposition(nextWord)) {

        // shift off the preposition
        let prepositionPair: Pair = listOfNextWords.shift() as Pair
        // create new preposition using shifted pair
        let currentPreposition: Preposition =
            new Preposition(prepositionPair.name)
        // add adverb to preposition's modifier list
        currentPreposition.addModifier(thisAdverb)
        // add potential following object to preposition
        currentPreposition.tagIfObject(listOfNextWords)
        return currentPreposition

    } else if (nextWord && isAdverb(nextWord)) {

        let nextAdverb: Pair = listOfNextWords.shift() as Pair
        let aPhrase: Adverb = new Adverb(nextAdverb.name)
        aPhrase.addModifier(thisAdverb)
        return aPhrase
    } else {
        return thisAdverb
    }
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