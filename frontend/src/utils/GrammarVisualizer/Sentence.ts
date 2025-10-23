import {
    isAdverb, isConjunction, isNoun, isNounModifier,
    isPredicate,
    isPreposition,
} from "../partOfSpeechUtils/partOfSpeechUtils"
import { Adverb } from "../Syntactic Categories/Adverb"
import { Noun } from "../Syntactic Categories/Noun"
import { Preposition } from "../Syntactic Categories/Preposition"
import { Verb } from "../Syntactic Categories/Verb"
import { ecmVerbs, objectControlVerbs, PartsOfSpeech, raisingVerbs }
    from "../SyntaxConstants"
import type { Pair } from "./Pair"

export class Sentence {

    private posInfo: number[]
    private wordInfo: string[]
    public clauses: Verb[]
    public numberOfClauses: number


    constructor(posInfo: number[], wordInfo: string[]) {
        this.posInfo = posInfo
        this.wordInfo = wordInfo
        this.clauses = []
        this.numberOfClauses = 0
    }

    public uncontractSent(): void {
        let posList: number[] = this.posInfo
        let wordList: string[] = this.wordInfo

        let alignedWordList: string[] = []

        // for (const word of wordList) {
        //     if (word === "didn't") {
        //         alignedWordList.push("did")
        //         alignedWordList.push("n't")
        //     } else if (word === "doesn't") {
        //         alignedWordList.push("does")
        //         alignedWordList.push("n't")
        //     } else if (word === "don't") {
        //         alignedWordList.push("do")
        //         alignedWordList.push("n't")
        //     } else if (word === "haven't") {
        //         alignedWordList.push("have")
        //         alignedWordList.push("n't")
        //     } else if (word === "hasn't") {
        //         alignedWordList.push("has")
        //         alignedWordList.push("n't")
        //     } else if (word === "hadn't") {
        //         alignedWordList.push("had")
        //         alignedWordList.push("n't")
        //     } else {
        //         alignedWordList.push(word)
        //     }
        // }

        this.posInfo = posList
        this.wordInfo = wordList
    }

    /**
     * should probably break this up into smaller functions
     */
    public fixPartsOfSpeech(): void {
        let posList: number[] = this.posInfo
        let wordList: string[] = this.wordInfo

        for (let i = 0; i < wordList.length; i++) {
            console.log(posList[i])
            console.log(wordList[i])

            if ((
                wordList[i] === "do" ||
                wordList[i] === "does" ||
                wordList[i] === "did"
            ) && (
                    wordList[i + 1] === "n't"
                )
            ) {
                posList[i] = PartsOfSpeech.TENSE

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
            }
        }

        this.posInfo = posList
    }

    public generateClauses(): void {
        let zippedPairs: Pair[] = this.createZippedPairs()

        let currentPredicate: Verb | null = null
        let clauseNouns: Noun[] = []
        let clauseAdjuncts: (Adverb | Preposition)[] = []
        let nounModifiers: string[] = []

        while (zippedPairs.length > 0) {

            let currentPair: Pair | undefined = zippedPairs.shift()
            if (currentPair !== undefined) {

                if (isNounModifier(currentPair)) {
                    nounModifiers.push(currentPair.name)

                } else if (
                    currentPair.pos === PartsOfSpeech.QuestionTense
                ) {
                    console.log(currentPair.name)
                    let questionModifier: Adverb = new Adverb(currentPair.name)
                    clauseAdjuncts.push(questionModifier)


                } else if (isAdverb(currentPair)) {
                    let modPhrase: Preposition | Adverb =
                        this.resolveAdverbAttachment(
                            currentPair,
                            zippedPairs
                        )
                    clauseAdjuncts.push(modPhrase)

                } else if (isPredicate(currentPair, zippedPairs)) {
                    console.log("I found a clause")
                    console.log(currentPair.name)
                    if (currentPredicate) {
                        console.log("there are two clauses")
                        this.addMatrixClauseArguments(
                            currentPredicate,
                            clauseNouns
                        )
                    }
                    let vPhrase: Verb = new Verb(currentPair.name)
                    currentPredicate = vPhrase
                    this.clauses.push(vPhrase)
                    this.numberOfClauses += 1


                } else if (isNoun(currentPair)) {
                    let nPhrase: Noun =
                        this.createNounPhrase(
                            currentPair,
                            nounModifiers
                        )
                    clauseNouns.push(nPhrase)

                } else if (
                    currentPredicate &&
                    isConjunction(currentPair)
                ) {
                    for (const noun of clauseNouns) {
                        currentPredicate.addNoun(noun)
                    }
                    for (const modifier of clauseAdjuncts) {
                        currentPredicate.addAdjunct(modifier)
                    }

                    clauseNouns = []
                    clauseAdjuncts = []
                    currentPredicate = null


                } else if (
                    isPreposition(currentPair) &&
                    currentPredicate
                ) {
                    let pPhrase: Preposition =
                        this.createPrepositionalPhrase(
                            currentPair,
                            zippedPairs
                        )
                    clauseAdjuncts.push(pPhrase)
                }
            }
        }

        if (currentPredicate) {
            for (const noun of clauseNouns) {
                currentPredicate.addNoun(noun)
            }
            for (const modifier of clauseAdjuncts) {
                currentPredicate.addAdjunct(modifier)
            }
        }
    }

    /**
     * 
     * @param matrixPredicate 
     * @param nounArguments 
     * needs to be split into smaller functions depending on the verb type
     */
    private addMatrixClauseArguments(
        matrixPredicate: Verb,
        nounArguments: Noun[]
    ) {
        if (
            // is objectControl with two nouns
            nounArguments.length > 1 &&
            Array
                .from(objectControlVerbs)
                .some(item => matrixPredicate
                    .getName()
                    .includes(item))
            // I asked him to win
        ) {
            // add nouns to matrix clause

            // Matrix subject is first noun argument
            let matrixSubject: Noun = nounArguments.shift() as Noun
            // Matrix object is second noun argument
            let matrixObject: Noun = nounArguments[0]

            matrixPredicate.addNoun(matrixSubject)
            matrixPredicate.addNoun(matrixObject)

        } else if (
            // is object control with 1 noun
            nounArguments.length === 1 &&
            Array
                .from(objectControlVerbs)
                .some(item => matrixPredicate
                    .getName()
                    .includes(item))
            // I asked to win
        ) {
            // add noun to matrix clause
            let matrixSubject: Noun = nounArguments[0]
            matrixPredicate.addNoun(matrixSubject)

        } else if (
            // is raising predicate with multiple nouns 
            nounArguments.length > 1 &&
            Array
                .from(raisingVerbs)
                .some(item => matrixPredicate
                    .getName()
                    .includes(item)
                )
            // I expected him to win
        ) {
            // first add first noun to matrix predicate
            let matrixSubject: Noun = nounArguments.shift() as Noun
            matrixPredicate.addNoun(matrixSubject)

        } else if (
            // ECM verb with multiple nouns
            nounArguments.length > 1 &&
            Array
                .from(ecmVerbs)
                .some(item => matrixPredicate
                    .getName()
                    .includes(item)
                )
            // I saw him win
        ) {

            // add first noun to matrix clause
            let matrixSubject: Noun = nounArguments.shift() as Noun
            matrixPredicate.addNoun(matrixSubject)

        } else if (
            // subject control with multiple nouns
            nounArguments.length > 1
            // I used him to win
        ) {
            // Add subject to matrix clause
            let matrixSubject: Noun = nounArguments[0]
            matrixPredicate.addNoun(matrixSubject)
            // add object to matrix clause
            let matrixObject: Noun = nounArguments.pop() as Noun
            matrixPredicate.addNoun(matrixObject)


        } else {
            // there is only one noun
            // add subject to matrix clause
            let matrixSubject: Noun = nounArguments[0]
            matrixPredicate.addNoun(matrixSubject)
        }
    }


    private createZippedPairs(): Pair[] {
        let zipped: Pair[] = []

        let listOfPos: number[] = this.posInfo
        let listOfWords: string[] = this.wordInfo

        for (let i = 0; i < listOfPos.length; i++) {
            let pair: Pair = {

                pos: listOfPos[i],
                name: listOfWords[i]
            }
            zipped.push(pair)
        }
        return zipped
    }

    /**
     * Determines if an adverb modifies a clause or a preposition
     * If it modifies a preposition, it returns the full PP
     * Otherwise it returns the Adverb
     */
    private resolveAdverbAttachment(
        adverbPair: Pair,
        listOfNextWords: Pair[]
    ): Preposition | Adverb {
        let nextWord: Pair = listOfNextWords[0]

        if (isPreposition(nextWord)) {

            // shift off the preposition
            let prepositionPair: Pair = listOfNextWords.shift() as Pair
            // create new preposition using shifted pair
            let currentPreposition: Preposition =
                new Preposition(prepositionPair.name)
            // add adverb to preposition's modifier list
            currentPreposition.addModifier(adverbPair.name)

            // add potential following object to preposition
            currentPreposition.tagIfObject(listOfNextWords)
            return currentPreposition

        } else {
            return new Adverb(adverbPair.name)
        }
    }

    private createPrepositionalPhrase(
        prepositionPair: Pair,
        restOfSent: Pair[]
    ): Preposition {
        let prepositionalPhrase: Preposition =
            new Preposition(prepositionPair.name)
        prepositionalPhrase.tagIfObject(restOfSent)

        return prepositionalPhrase
    }

    private createNounPhrase(nounPair: Pair, modifiers: string[]): Noun {
        let nounPhrase: Noun = new Noun(nounPair.name)
        if (modifiers.length > 0) {
            while (modifiers.length > 0) {
                let modifier: string = modifiers.pop() as string
                nounPhrase.addModifier(modifier)
            }
        }
        return nounPhrase
    }
}