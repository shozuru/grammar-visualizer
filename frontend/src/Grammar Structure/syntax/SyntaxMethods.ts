import type { Word } from "../types/Word"
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


export function addInfModToPred(pred: Predicate): void {
    let infMod: Mod =
        new Mod({ name: "inf", pos: PartsOfSpeech.VBINF })
    pred.addMod(infMod)
}

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

export function addPredModsAndArgs(
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

// export function addCaustiveModifier(
//     agentNoun: Noun,
//     causativePair: Pair
// ): Noun {
//     agentNoun.addModifier(new Mod(causativePair))
//     return agentNoun
// }

export function addClauseArgumentsAndAdjuncts(
    relClause: Clause,
    listOfWords: Word[]
): void {
    // gets clause arguments and modifiers and adds them to the clause

    let nounModStack: Mod[] = []
    let adverbModStack: Mod[] = []
    let adverbAgrStack: Agr[] = []

    while (listOfWords[0] && !isVerbalElement(listOfWords[0])) {

        let currentWord: Word = listOfWords.shift() as Word

        // this part is literally the same as in the main sentence method i feel
        // like we need to move stuff so that we can just reuse the same code

        if (isNounModifier(currentWord, listOfWords)) {
            nounModStack.push(new Mod(currentWord))
        } else if (isAdverbMod(currentWord)) {
            adverbModStack.push(new Mod(currentWord))
        } else if (isAdverbAgr(currentWord)) {
            adverbAgrStack.push(new Agr(currentWord))
        }

        // else if (
        //     isCausative(currentPair)
        // ) {
        //     if (
        //         relClause.getNouns().length > 1
        //     ) {
        //         relClause
        //             .getNouns()[-1]
        //             .addModifier(new Mod(currentPair))

        //     } else {
        //         relClause
        //             .getNouns()[0]
        //             .addModifier(new Mod(currentPair))
        //     }
        // }

        else if (
            isPassive(currentWord)
        ) {
            nounModStack.push(new Mod(currentWord))
        }
        else if (isNoun(currentWord)) {
            let nPhrase: Noun = createNounPhrase(
                currentWord,
                nounModStack
            )
            addPhraseToClause(nPhrase, relClause)

        } else if (isAdverb(currentWord)) {
            let aPhrase: Adverb = new Adverb(currentWord.name)
            addAdverbModsAndArgs(aPhrase, adverbModStack, adverbAgrStack)

            let modPhrase: Adverb | Preposition =
                resolveAdverbAttachment(aPhrase, listOfWords)
            addPhraseToClause(modPhrase, relClause)

        } else if (isPreposition(currentWord)) {
            let pPhrase: Preposition = new Preposition(currentWord.name)
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
            .some((Word) => Word.getPos() === PartsOfSpeech.PsvAgr)
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

export function createRel(listOfWords: Word[], noun: Noun): Clause | null {
    let relWord: Word = listOfWords.shift() as Word
    let relSystem: Relativize = new Relativize(relWord.name)
    noun.setRelativizer(relSystem)

    let relNoun: Noun = new Noun(relSystem.getName())
    console.log(noun)

    let relClause: Clause | null = createRelClause(relNoun, listOfWords)
    return relClause
}

export function createRelClause(
    relSystemNoun: Noun,
    listOfWords: Word[]
): Clause | null {

    let relSubject: Noun | null = null

    // i think it would be better to causative it here
    // this all should be in a 'while not a verb'
    // this is the man -that- [let me go]
    // this is the man -that- [i let go]

    while (!isVerbalElement(listOfWords[0])) {
        if (isNominalElement(listOfWords[0], listOfWords.slice(1))) {
            relSubject = handleNounPhrase(listOfWords)
        }

        // if (isNominalElement(listOfPairs[0], listOfPairs.slice(1))) {
        //     let nounModStack: Mod[] = []

        //     while (!isNoun(listOfPairs[0])) {
        //         if (isNounModifier(listOfPairs[0], listOfPairs.slice(1))) {
        //             let nounModPair: Pair = listOfPairs.shift() as Pair
        //             let nounMod: Mod = new Mod(nounModPair)
        //             nounModStack.push(nounMod)
        //         }
        //     }
        //     let relSubPair: Pair = listOfPairs.shift() as Pair
        //     relSubject = createNounPhrase(
        //         relSubPair,
        //         nounModStack
        //     )
        // } 
        if (isCausative(listOfWords[0])) {
            let causeWord: Word = listOfWords.shift() as Word
            let causeMod: Mod = new Mod(causeWord)
            if (relSubject !== null) {
                relSubject.addModifier(causeMod)
            } else {
                relSystemNoun.addModifier(causeMod)
            }
        }
        // this is the man that slowly ran
        // this is the man that ran slowly
        // this is the man that the slowest woman beat
        if (isAdverb(listOfWords[0])) {
            let adverbWord: Word = listOfWords.shift() as Word
            let aPhrase: Adverb = new Adverb(adverbWord.name)

            addAdverbModsAndArgs(aPhrase, adverbModStack, adverbAgrStack)

            let modPhrase: Adverb | Preposition =
                resolveAdverbAttachment(aPhrase, listOfWords)
            addPhraseToClause(modPhrase, relClause)

        }
    }

    // if it is passive
    // it might be better to handle this here

    let verbModStack: Mod[] = []
    let verbAgrStack: Agr[] = []

    while (listOfWords[0] && !isVerb(listOfWords[0])) {
        if (isVerbModifier(listOfWords[0])) {
            let verbModWord: Word = listOfWords.shift() as Word
            let verbMod: Mod = new Mod(verbModWord)
            verbModStack.push(verbMod)
        } else {
            let verbAgrWord: Word = listOfWords.shift() as Word
            let verbAgr: Agr = new Agr(verbAgrWord)
            verbAgrStack.push(verbAgr)
        }
    }

    if (isVerb(listOfWords[0])) {
        // add predicate to relative clause
        let relVerbWord: Word = listOfWords.shift() as Word
        let relVerb: Verb = new Verb(relVerbWord.name)

        let relPred: Predicate = new Predicate(relVerb)
        // add mods and agrs
        for (let mod of verbModStack) {
            relPred.addMod(mod)
        }
        for (let agr of verbAgrStack) {
            relPred.addAgr(agr)
        }
        let relClause: Clause = new Clause(relPred)


        if (relSubject !== null) {
            if (
                relSubject
                    .getModifiers()
                    .some(
                        mod =>
                            mod.getPos() === PartsOfSpeech.CAUSATIVE
                    )
            ) {
                relClause.setCausativeNoun(relSubject)
            } else {
                relClause.addNounToClause(relSubject)
            }
        }
        if (relSystemNoun
            .getModifiers()
            .some(
                mod =>
                    mod.getPos() === PartsOfSpeech.CAUSATIVE
            )
        ) {
            relClause.setCausativeNoun(relSystemNoun)
        } else {
            relClause.addNounToClause(relSystemNoun)
        }
        addClauseArgumentsAndAdjuncts(relClause, listOfWords)
        return relClause
    }
    return null
}

export function createRosClause(
    rosPred: Predicate,
    subject: Noun,
    adjunctStack: (Adverb | Preposition)[],
    wordList: Word[]
): {
    rosClause: Clause
    nextClauseSubject: Noun | null
} {
    let rosClause = new Clause(rosPred)
    rosClause.addNounToClause(subject)
    for (let adjunct of adjunctStack) {
        rosClause.addAdjunct(adjunct)
    }
    let nextClauseSubject: Noun | null =
        handleRosObjects(rosClause, wordList)
    return { rosClause, nextClauseSubject }
}

/**
   * should probably break this up into smaller functions
   */
export function fixPartsOfSpeech(WordedList: Word[]): Word[] {
    for (let i = 0; i < WordedList.length; i++) {
        if (
            (
                WordedList[i].name === "don't" ||
                WordedList[i].name === "doesn't" ||
                WordedList[i].name === "didn't"
            ) && (
                WordedList[i].pos === PartsOfSpeech.RB
            )
        ) {
            WordedList[i].pos = PartsOfSpeech.NEGATION

        } else if (
            (
                WordedList[i].name === "do" ||
                WordedList[i].name === "does" ||
                WordedList[i].name === "did"
            ) && (
                (
                    WordedList[i + 1].name === "n't" ||
                    WordedList[i + 1].name === "not"
                )
            )
        ) {
            WordedList[i].pos = PartsOfSpeech.TENSE
            if (WordedList[i + 1].name === "not") {
                WordedList[i + 1].pos = PartsOfSpeech.NEGATION
            }

        } else if ((
            WordedList[i].name === "have" ||
            WordedList[i].name === "has" ||
            WordedList[i].name === "had"
        ) && (
                WordedList[i + 1].pos === PartsOfSpeech.RB
            )
        ) {
            WordedList[i].pos = PartsOfSpeech.PERFECTIVE

        } else if (
            (
                WordedList[i].name === "have" ||
                WordedList[i].name === "has" ||
                WordedList[i].name === "had"
            ) && (
                WordedList[i + 1].pos == PartsOfSpeech.VBN
            )) {
            WordedList[i].pos = PartsOfSpeech.PERFECTIVE
        } else if (
            isBeVerb(WordedList[i].name) &&
            WordedList[i + 1].pos === PartsOfSpeech.VBN
        ) {
            WordedList[i].pos = PartsOfSpeech.PsvAgr

            let index: number =
                passiveByPhraseIndex(WordedList.slice(i))

            if (index >= 0) {
                WordedList[i + index].pos = PartsOfSpeech.PASSIVE
            }
        }

        if ((
            i === 0 && (
                WordedList[i].pos === PartsOfSpeech.VBD ||
                WordedList[i].pos === PartsOfSpeech.VBZ ||
                WordedList[i].pos === PartsOfSpeech.VBP ||
                WordedList[i].pos === PartsOfSpeech.MD ||
                WordedList[i].pos === PartsOfSpeech.TENSE
            )

        ) && (
                isNoun(
                    {
                        pos: WordedList[i + 1].pos,
                        name: WordedList[i + 1].name
                    }
                ) || (
                    isAdverb(
                        {
                            pos: WordedList[i + 1].pos,
                            name: WordedList[i + 1].name
                        }
                    )
                    &&
                    isNoun(
                        {
                            pos: WordedList[i + 2].pos,
                            name: WordedList[i + 2].name
                        }
                    )
                )
            )
        ) {
            WordedList[i].pos = PartsOfSpeech.QuestionTense
        } else if (
            (
                WordedList[i].name === "make" ||
                WordedList[i].name === "made" ||
                WordedList[i].name === "let"
            ) && (
                WordedList
                    .slice(i)
                    .some(item => item.pos === PartsOfSpeech.VB)
            )
        ) {
            WordedList[i].pos = PartsOfSpeech.CAUSATIVE
        } else if (
            WordedList[i].pos === PartsOfSpeech.DT &&
            (
                WordedList[i + 1].pos === PartsOfSpeech.RBS ||
                WordedList[i + 1].pos === PartsOfSpeech.JJS
            )
        ) {
            WordedList[i].pos = PartsOfSpeech.AdvAgr
            if (WordedList[i + 1].name === "most") {
                WordedList[i + 1].pos = PartsOfSpeech.SUPERLATIVE
            }
        } else if (
            WordedList[i].pos === PartsOfSpeech.SUPERLATIVE &&
            WordedList[i + 1].pos === PartsOfSpeech.NN
        ) {
            WordedList[i + 1].pos = PartsOfSpeech.RB
        } else if (
            WordedList[i].pos === PartsOfSpeech.TO &&
            WordedList[i].name === "to"
        ) {
            WordedList[i].pos = PartsOfSpeech.InfAgr
        } else if (
            WordedList[i].pos === PartsOfSpeech.JJ
        ) {
            WordedList[i].pos = PartsOfSpeech.RB
        } else if (
            WordedList[i].pos === PartsOfSpeech.JJR
        ) {
            WordedList[i].pos = PartsOfSpeech.RBR
        } else if (
            WordedList[i].pos === PartsOfSpeech.JJS
        ) {
            WordedList[i].pos = PartsOfSpeech.RBS
        } else if (
            WordedList[i].pos === PartsOfSpeech.RB &&
            WordedList[i].name === "not"
        ) {
            WordedList[i].pos = PartsOfSpeech.NEGATION
        } else if (
            WordedList[i].pos === PartsOfSpeech.DT &&
            isVerb(WordedList[i + 1])
        ) {
            WordedList[i].pos = PartsOfSpeech.PRP
        }
    }
    return WordedList
}

export function handleAdverbPhrase(wordList: Word[]): Adverb | Preposition {
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
    let headWord: Word = wordList.shift() as Word
    let headPhrase: Adverb = new Adverb(headWord.name)

    addAdverbModsAndArgs(headPhrase, modStack, agrStack)

    let modPhrase: Adverb | Preposition =
        resolveAdverbAttachment(headPhrase, wordList)
    return modPhrase
}

export function handleNounPhrase(listOfWords: Word[]): Noun {
    let nounModStack: Mod[] = []

    while (!isNoun(listOfWords[0])) {
        if (isNounModifier(listOfWords[0], listOfWords.slice(1))) {
            let modWord: Word = listOfWords.shift() as Word
            let mod: Mod = new Mod(modWord)
            nounModStack.push(mod)
        }
    }
    let headWord: Word = listOfWords.shift() as Word
    return (createNounPhrase(headWord, nounModStack))
}

export function handlePrepositionPhrase(wordList: Word[]) {
    let headWord: Word = wordList.shift() as Word
    return createPrepositionalPhrase(headWord, wordList)
}

export function handlePredicatePhrase(wordList: Word[]): Predicate {
    let modStack: Mod[] = []
    let agrStack: Agr[] = []

    while (!isVerb(wordList[0])) {
        if (isVerbModifier(wordList[0])) {
            let modWord: Word = wordList.shift() as Word
            let mod: Mod = new Mod(modWord)
            modStack.push(mod)
        } else {
            let agrWord: Word = wordList.shift() as Word
            let agr: Agr = new Agr(agrWord)
            agrStack.push(agr)
        }
    }

    // add predicate to clause
    let headWord: Word = wordList.shift() as Word
    let verb: Verb = new Verb(headWord.name)
    let pred: Predicate = new Predicate(verb)

    addPredModsAndArgs(pred, modStack, agrStack)
    return pred
}

export function handlePreVerbAgrs(pred: Predicate): void {
    let passiveAgr: Agr | null =
        removeAgr(this.predAgrStack, PartsOfSpeech.PsvAgr)
    let infAgr: Agr | null =
        removeAgr(this.predAgrStack, PartsOfSpeech.InfAgr)
    if (passiveAgr) {
        this.currentPredicate.addAgr(passiveAgr)
    }
    if (infAgr) {
        this.currentPredicate.addAgr(infAgr)
    }
}

export function handleRosObjects(
    rosClause: Clause,
    wordList: Word[]
): Noun | null {

    if (isNominalElement(wordList[0], wordList.slice(1))) {
        let nPhrase: Noun = handleNounPhrase(wordList)

        if (isObjectControlPred(rosClause.getPredicate())) {
            rosClause.addNounToClause(nPhrase)
        }
        return nPhrase
    }
    return null
}

export function hasMultipleNouns(nounList: Noun[]): boolean {
    return nounList.length > 1
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
    return word.pos === PartsOfSpeech.SUPERLATIVE
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
    if (
        word.pos === PartsOfSpeech.CAUSATIVE
    ) {
        return true
    }
    return false
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

export function isNominalElement(word: Word, listOfWords: Word[]): boolean {
    return (
        isNoun(word) ||
        isNounModifier(word, listOfWords)
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
    if (
        word.pos === PartsOfSpeech.PASSIVE
    ) {
        return true
    }
    return false
}

export function isPredicate(
    word: Word,
    restOfSent: Word[]
): boolean {

    let currentPOS: number = word.pos

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
        word.pos === PartsOfSpeech.WDT
    )
}

export function isRosVerb(pred: Predicate): boolean {
    return (
        raisingVerbs.some(
            raisingVerb => pred
                .getVerb()
                .getName()
                .includes(raisingVerb)
        ) ||
        objectControlVerbs.some(
            objectVerb => pred
                .getVerb()
                .getName()
                .includes(objectVerb)
        ) ||
        ecmVerbs.some(ecmVerb => pred
            .getVerb()
            .getName()
            .includes(ecmVerb)
        )
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

export function isVerb(word: Word): boolean {
    return (
        word.pos === PartsOfSpeech.VB ||
        word.pos === PartsOfSpeech.VBD ||
        word.pos === PartsOfSpeech.VBN ||
        word.pos === PartsOfSpeech.VBP ||
        word.pos === PartsOfSpeech.VBZ
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

export function passiveByPhraseIndex(
    listOfWords: Word[]

): number {
    let index: number = listOfWords.length - 1

    // if (!isNoun(listOfWords[index])) {
    //     return null
    // }
    // index -= 1
    while (index >= 0) {
        if (listOfWords[index].name === "by") {
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
    listOfNextWords: Word[]
): Preposition | Adverb {

    // let thisAdverb: Adverb = new Adverb(firstarg.name)
    let nextWord: Word = listOfNextWords[0]

    if (nextWord && isPreposition(nextWord)) {

        // shift off the preposition
        let prepositionWord: Word = listOfNextWords.shift() as Word
        // create new preposition using shifted Word
        let currentPreposition: Preposition =
            new Preposition(prepositionWord.name)
        // add adverb to preposition's modifier list
        currentPreposition.addModifier(thisAdverb)
        // add potential following object to preposition
        currentPreposition.tagIfObject(listOfNextWords)
        return currentPreposition

    } else if (nextWord && isAdverb(nextWord)) {

        let nextAdverb: Word = listOfNextWords.shift() as Word
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