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
import { Agr } from "./Agr"
import { Predicate } from "./Predicate"
import { Sentence } from "./Sentence"


export function addAdverbModsAndArgs(
    adverb: Adverb,
    modStack: Mod[],
    agrStack: Agr[]
): void {
    if (
        modStack.length > 0
    ) {
        for (const modifier of modStack) {
            adverb.addModifier(modifier)
        }
    }
    if (
        agrStack.length > 0
    ) {
        for (const agr of agrStack) {
            adverb.addAdverbAgr(agr)
        }
    }
}

export function addCaustiveModifier(
    agentNoun: Noun,
    causeWord: Word
): void {
    agentNoun.addModifier(new Mod(causeWord))
}

export function addMatrixClauseMods(
    matrixPred: Predicate, listOfMods: Mod[]
): void {
    while (listOfMods.length > 0) {
        let mod: Mod = listOfMods.shift() as Mod
        matrixPred.addMod(mod)
    }
}

export function addModsIfPresent(adverbWord: Word): Mod | null {
    if (adverbWord.pos === PartsOfSpeech.RBS) {

        let superlative: Mod = new Mod(
            {
                name: "superlative",
                pos: PartsOfSpeech.SUPERLATIVE
            }
        )
        return superlative

    } else if (adverbWord.pos === PartsOfSpeech.RBR) {

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

export function addPredModsAndAgrs(
    pred: Predicate,
    modStack: Mod[],
    agrStack: Agr[]
): void {
    if (
        modStack.length > 0
    ) {
        for (let mod of modStack) {
            pred.addMod(mod)
        }
    }
    if (
        agrStack.length > 0
    ) {
        for (let agr of agrStack) {
            pred.addAgr(agr)
        }
    }
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

    let relSentence: Sentence = new Sentence(relClauseWords)
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

export function createCompleteClause(
    pred: Predicate,
    subject: Noun,
    nounStack: Noun[],
    adjunctStack: (Adverb | Preposition)[]
): void {
    // if (
    //     this.currentPredicate instanceof Predicate &&
    //     this.currentSubject instanceof Noun
    // ) {
    let completeClause: Clause = new Clause(pred)
    completeClause.addNounToClause(subject)

    for (let noun of nounStack) {
        completeClause.addNounToClause(noun)
    }
    for (let adjunct of adjunctStack) {
        completeClause.addAdjunct(adjunct)
    }
    Sentence.clauses.push(completeClause)
    // }
}

export function createNounPhrase(nounWord: Word, modifiers: Mod[]): Noun {
    let nounPhrase: Noun = new Noun(nounWord.name)
    while (modifiers.length > 0) {
        let mod: Mod = modifiers.pop() as Mod
        nounPhrase.addModifier(mod)
    }
    return nounPhrase
}

export function createPrepositionalPhrase(
    prepositionWord: Word,
    restOfSent: Word[]
): Preposition {
    let prepositionalPhrase: Preposition =
        new Preposition(prepositionWord.name)
    prepositionalPhrase.tagIfObject(restOfSent)

    return prepositionalPhrase
}

export function createRosClause(
    rosPred: Predicate,
    subject: Noun,
    adjunctStack: (Adverb | Preposition)[],
    wordList: Word[]
): {
    clause: Clause
    nextSubject: Noun | null
} {
    let clause = new Clause(rosPred)
    clause.addNounToClause(subject)
    for (let adjunct of adjunctStack) {
        clause.addAdjunct(adjunct)
    }
    let nextSubject: Noun | null =
        handleRosObjects(clause, wordList)
    return { clause, nextSubject }
}

/**
   * should probably break this up into smaller functions
   */
export function fixPartsOfSpeech(wordList: Word[]): Word[] {
    for (let i = 0; i < wordList.length; i++) {
        if (
            (
                wordList[i].name === "don't" ||
                wordList[i].name === "doesn't" ||
                wordList[i].name === "didn't"
            ) && (
                wordList[i].pos === PartsOfSpeech.RB
            )
        ) {
            wordList[i].pos = PartsOfSpeech.NEGATION

        } else if (
            (
                wordList[i].name === "do" ||
                wordList[i].name === "does" ||
                wordList[i].name === "did"
            ) && (
                (
                    wordList[i + 1].name === "n't" ||
                    wordList[i + 1].name === "not"
                )
            )
        ) {
            wordList[i].pos = PartsOfSpeech.TENSE
            if (wordList[i + 1].name === "not") {
                wordList[i + 1].pos = PartsOfSpeech.NEGATION
            }

        } else if ((
            wordList[i].name === "have" ||
            wordList[i].name === "has" ||
            wordList[i].name === "had"
        ) && (
                wordList[i + 1].pos === PartsOfSpeech.RB
            )
        ) {
            wordList[i].pos = PartsOfSpeech.PERFECTIVE

        } else if (
            (
                wordList[i].name === "have" ||
                wordList[i].name === "has" ||
                wordList[i].name === "had"
            ) && (
                wordList[i + 1].pos == PartsOfSpeech.VBN
            )) {
            wordList[i].pos = PartsOfSpeech.PERFECTIVE
        } else if (isBeVerb(wordList[i].name)) {
            let j: number = i + 1
            while (
                wordList[j] &&
                wordList[j].pos !== PartsOfSpeech.VBN &&
                wordList[j].pos !== PartsOfSpeech.IN &&
                wordList[j].pos !== PartsOfSpeech.WDT &&
                wordList[j].pos !== PartsOfSpeech.TO

            ) {
                j += 1
            }
            if (wordList[j] &&
                wordList[j].pos === PartsOfSpeech.VBN
            ) {
                wordList[i].pos = PartsOfSpeech.PsvAgr

                let index: number =
                    passiveByPhraseIndex(wordList.slice(j))

                if (index >= 0) {
                    wordList[j + index].pos = PartsOfSpeech.PASSIVE
                }
            }
        }

        if ((
            i === 0 && (
                wordList[i].pos === PartsOfSpeech.VBD ||
                wordList[i].pos === PartsOfSpeech.VBZ ||
                wordList[i].pos === PartsOfSpeech.VBP ||
                wordList[i].pos === PartsOfSpeech.MD ||
                wordList[i].pos === PartsOfSpeech.TENSE
            )

        ) && (
                isNoun(
                    {
                        pos: wordList[i + 1].pos,
                        name: wordList[i + 1].name
                    }
                ) || (
                    isAdverb(
                        {
                            pos: wordList[i + 1].pos,
                            name: wordList[i + 1].name
                        }
                    )
                    &&
                    isNoun(
                        {
                            pos: wordList[i + 2].pos,
                            name: wordList[i + 2].name
                        }
                    )
                )
            )
        ) {
            wordList[i].pos = PartsOfSpeech.QuestionTense
        } else if (
            (
                wordList[i].name === "make" ||
                wordList[i].name === "made" ||
                wordList[i].name === "let"
            ) && (
                wordList
                    .slice(i)
                    .some(item => item.pos === PartsOfSpeech.VB)
            )
        ) {
            wordList[i].pos = PartsOfSpeech.CAUSATIVE
        } else if (
            wordList[i].pos === PartsOfSpeech.DT &&
            (
                wordList[i + 1].pos === PartsOfSpeech.RBS ||
                wordList[i + 1].pos === PartsOfSpeech.JJS
            )
        ) {
            wordList[i].pos = PartsOfSpeech.AdvAgr
            if (wordList[i + 1].name === "most") {
                wordList[i + 1].pos = PartsOfSpeech.SUPERLATIVE
            }
        } else if (
            wordList[i].pos === PartsOfSpeech.SUPERLATIVE &&
            wordList[i + 1].pos === PartsOfSpeech.NN
        ) {
            wordList[i + 1].pos = PartsOfSpeech.RB
        } else if (
            wordList[i].pos === PartsOfSpeech.TO &&
            wordList[i].name === "to"
        ) {
            wordList[i].pos = PartsOfSpeech.InfAgr
        } else if (
            wordList[i].pos === PartsOfSpeech.JJ
        ) {
            wordList[i].pos = PartsOfSpeech.RB
        } else if (
            wordList[i].pos === PartsOfSpeech.JJR
        ) {
            wordList[i].pos = PartsOfSpeech.RBR
        } else if (
            wordList[i].pos === PartsOfSpeech.JJS
        ) {
            wordList[i].pos = PartsOfSpeech.RBS
        } else if (
            wordList[i].pos === PartsOfSpeech.RB &&
            wordList[i].name === "not"
        ) {
            wordList[i].pos = PartsOfSpeech.NEGATION
        } else if (
            wordList[i].pos === PartsOfSpeech.DT &&
            isVerb(wordList[i + 1])
        ) {
            wordList[i].pos = PartsOfSpeech.PRP
        }
    }
    return wordList
}

export function handleAdverbPhrase(
    wordList: Word[]
): Adverb | Preposition | Noun {
    let modStack: Mod[] = []
    let agrStack: Agr[] = []

    while (!isAdverb(wordList[0])) {
        if (isAdverbMod(wordList[0])) {
            let modWord: Word = wordList.shift() as Word
            let mod: Mod = new Mod(modWord)
            modStack.push(mod)
        } else {
            let agrWord: Word = wordList.shift() as Word
            let agr: Agr = new Agr(agrWord)
            agrStack.push(agr)
        }
    }
    let supletiveMod: Mod | null = addModsIfPresent(wordList[0])
    if (supletiveMod instanceof Mod) {
        modStack.push(supletiveMod)
    }
    if (wordList[1] && isNominalElement(wordList.slice(1))) {
        let nRelPhrase: Noun = handleNounPhrase(wordList)
        return nRelPhrase
    }
    let headWord: Word = wordList.shift() as Word
    let headPhrase: Adverb = new Adverb(headWord.name)

    addAdverbModsAndArgs(headPhrase, modStack, agrStack)

    let modPhrase: Adverb | Preposition | Noun =
        resolveAdverbAttachment(headPhrase, wordList)
    return modPhrase
}

export function handleNounPhrase(
    wordList: Word[]
): Noun {
    let nounModStack: Mod[] = []

    while (!isNoun(wordList[0])) {
        if (isNounModifier(wordList[0], wordList.slice(1))) {
            let modWord: Word = wordList.shift() as Word
            let mod: Mod = new Mod(modWord)
            nounModStack.push(mod)

        } else if (isAdverb(wordList[0])) {
            let relClause: Clause =
                addRelClauseToNounPhrase(wordList, nounModStack)
            Sentence.clauses.push(relClause)
            Sentence.numberOfClauses += 1
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
        Sentence.clauses.push(relClause)
        Sentence.numberOfClauses += 1
    }
    return createNounPhrase(headWord, nounModStack)
}

export function handlePrepositionPhrase(wordList: Word[]) {
    let headWord: Word = wordList.shift() as Word
    return createPrepositionalPhrase(headWord, wordList)
}

export function handlePredicatePhrase(
    subject: Noun | null,
    wordList: Word[]
): {
    pred: Predicate
    experiencer: Noun | null
    adverbStack: Adverb[]
} {
    let modStack: Mod[] = []
    let agrStack: Agr[] = []
    let experiencer: Noun | null = null
    let adverbStack: Adverb[] = []

    while (!isVerb(wordList[0])) {
        if (isVerbModifier(wordList[0])) {
            let modWord: Word = wordList.shift() as Word
            let mod: Mod = new Mod(modWord)
            modStack.push(mod)
        } else if (isVerbAgr(wordList[0])) {
            let agrWord: Word = wordList.shift() as Word
            let agr: Agr = new Agr(agrWord)
            agrStack.push(agr)
        } else if (
            subject instanceof Noun &&
            isCausative(wordList[0])
        ) {
            let causMod: Mod = new Mod(wordList.shift() as Word)
            subject.addModifier(causMod)
        } else if (isNominalElement(wordList)) {
            experiencer = handleNounPhrase(wordList)
        } else if (isAdverb(wordList[0])) {
            let adverbWord: Word = wordList.shift() as Word
            let aPhrase: Adverb = new Adverb(adverbWord.name)
            adverbStack.push(aPhrase)
        }
    }

    // add predicate to clause
    let headWord: Word = wordList.shift() as Word
    let verb: Verb = new Verb(headWord.name)
    let pred: Predicate = new Predicate(verb)

    addPredModsAndAgrs(pred, modStack, agrStack)
    return { pred, experiencer, adverbStack }
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
    wordList: Word[]
): Noun | null {

    if (isNominalElement(wordList)) {
        let nPhrase: Noun = handleNounPhrase(wordList)

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

export function isAdverbAgr(word: Word): boolean {
    return word.pos === PartsOfSpeech.AdvAgr
}

export function isAdverbElement(word: Word): boolean {
    return (
        isAdverb(word) ||
        isAdverbAgr(word) ||
        isAdverbMod(word)
    )
}

export function isAdverbMod(word: Word): boolean {
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

export function isNounModifier(word: Word, restOfSent: Word[]): boolean {
    let currentPOS: number = word.pos
    return (
        currentPOS === PartsOfSpeech.DT ||
        currentPOS === PartsOfSpeech.PRPQ ||
        currentPOS === PartsOfSpeech.PASSIVE ||
        (
            currentPOS === PartsOfSpeech.NNP &&
            restOfSent[0].pos === PartsOfSpeech.NN
        )
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

export function isVerbalElement(word: Word): boolean {
    return (
        isVerb(word) ||
        isVerbAgr(word) ||
        isVerbModifier(word)
    )
}

export function isVerbModifier(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.TENSE ||
        word.pos === PartsOfSpeech.PERFECTIVE ||
        word.pos === PartsOfSpeech.NEGATION ||
        word.pos === PartsOfSpeech.QuestionTense ||
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

export function resolveAdverbAttachment(
    thisAdverb: Adverb,
    wordList: Word[]
): Preposition | Adverb {

    let nextWord: Word = wordList[0]

    if (nextWord && isPreposition(nextWord)) {

        // shift off the preposition
        let prepositionWord: Word = wordList.shift() as Word
        // create new preposition using shifted Word
        let currentPreposition: Preposition =
            new Preposition(prepositionWord.name)
        // add adverb to preposition's modifier list
        currentPreposition.addModifier(thisAdverb)
        // add potential following object to preposition
        currentPreposition.tagIfObject(wordList)
        return currentPreposition

    } else if (nextWord && isAdverb(nextWord)) {

        let nextAdverb: Word = wordList.shift() as Word
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