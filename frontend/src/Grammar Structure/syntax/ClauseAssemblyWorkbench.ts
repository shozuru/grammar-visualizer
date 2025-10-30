import { Predicate } from "./Predicate"
import { Mod } from "./Mod"
import { Noun } from "./partsOfSpeech/Noun"
import { Preposition } from "./partsOfSpeech/Preposition"
import { Adverb } from "./partsOfSpeech/Adverb"
import type { Word } from "../types/Word"
import { Clause } from "./partsOfSpeech/Clause"
import {
    handleAdverbPhrase,
    handleNounPhrase, handlePredicatePhrase, handlePrepositionPhrase,
    isAdverbElement, isCausative, isNominalElement, isPreposition,
    isVerbalElement,
} from "./SyntaxMethods"

export class ClauseAssemblyWorkbench {

    private mainPredicate: Predicate | null
    private clauseSubject: Noun | null
    private nounStack: Noun[]
    private adjunctStack: (Preposition | Adverb)[]

    private clause: Clause | null

    constructor(wordList: Word[]) {
        this.mainPredicate = null
        this.clauseSubject = null
        this.nounStack = []
        this.adjunctStack = []
        this.clause = null
        this.sortClause(wordList)
    }


    private sortClause(wordList: Word[]): void {

        while (wordList[0]) {

            if (isCausative(wordList[0])) {
                let causeWord: Word = wordList.shift() as Word
                let causeMod: Mod = new Mod(causeWord)
                if (this.clauseSubject !== null) {
                    this.clauseSubject.addModifier(causeMod)
                }
                // else: relSystemNoun should have already been made the subject
                // else {
                //     relSystemNoun.addModifier(causeMod)
                // }
            }

            // if it is passive
            // it might be better to handle this here
        }
    }
}

// if (relSubject !== null) {
//     if (
//         relSubject
//             .getModifiers()
//             .some(
//                 mod =>
//                     mod.getPos() === PartsOfSpeech.CAUSATIVE
//             )
//     ) {
//         relClause.setCausativeNoun(relSubject)
//     } else {
//         relClause.addNounToClause(relSubject)
//     }
// }
// if (relSystemNoun
//     .getModifiers()
//     .some(
//         mod =>
//             mod.getPos() === PartsOfSpeech.CAUSATIVE
//     )
// ) {
//     relClause.setCausativeNoun(relSystemNoun)
// } else {
//     relClause.addNounToClause(relSystemNoun)
// }


//  public addClauseArgumentsAndAdjuncts(
//     relClause: Clause,
//     listOfWords: Word[]
// ): void {

//     while(listOfWords[0] && !isVerbalElement(listOfWords[0])) {
//             else if (
//         isPassive(currentWord)
//     ) {
//         nounModStack.push(new Mod(currentWord))
//     }

//     if (isPreposition(currentWord)) {
//         let pPhrase: Preposition = new Preposition(currentWord.name)
//         addPhraseToClause(pPhrase, relClause)
//     }
//     if (nounModStack.length > 0 &&
//         nounModStack[0].getName() === "by"
//     ) {
//         relClause
//             .getNouns()
//             .forEach(noun => {
//                 if (noun.getName() === "that") {
//                     let passiveMod: Mod = nounModStack.shift() as Mod
//                     noun.addModifier(passiveMod)
//                 }
//             })
//     }
// }
//     }