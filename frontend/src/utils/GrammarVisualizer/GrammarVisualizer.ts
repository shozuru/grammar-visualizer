import { Adverb } from "../Syntactic Categories/Adverbs"
import { Noun } from "../Syntactic Categories/Noun"
import { Preposition } from "../Syntactic Categories/Preposition"
import { Verb } from "../Syntactic Categories/Verb"
import { conjunctions, ecmVerbs, objectControlVerbs, PartsOfSpeech, raisingVerbs }
    from "../SyntaxConstants"
import { type SentenceInfo } from "../SyntaxMethods"
import { PosInfo } from "./PosInfo"
import { WordInfo } from "./WordInfo"

export class GrammarVisualizer {

    private posInfo: PosInfo
    private wordInfo: WordInfo
    private numberOfClauses: number
    private clauses: Verb[]

    constructor(sentInfo: SentenceInfo) {
        this.posInfo = new PosInfo(sentInfo.posList)
        this.wordInfo = new WordInfo(sentInfo.wordList)
        this.numberOfClauses = 0
        this.clauses = []
        this.uncontractSentence(this.wordInfo.getWordList())
        this.fixPartsOfSpeech(this.posInfo, this.wordInfo)

        this.generateClauses(
            this.posInfo.getPOSList(),
            this.wordInfo.getWordList()
        )

        console.log(`Number of clauses in sentence: ${this.numberOfClauses}`)
        console.log(this.clauses)
    }

    private uncontractSentence(wordList: string[]): void {

        let alignedWordList: string[] = []

        for (const word of wordList) {
            if (word === "didn't") {
                alignedWordList.push("did")
                alignedWordList.push("n't")
            } else if (word === "doesn't") {
                alignedWordList.push("does")
                alignedWordList.push("n't")
            } else if (word === "don't") {
                alignedWordList.push("do")
                alignedWordList.push("n't")
            } else if (word === "haven't") {
                alignedWordList.push("have")
                alignedWordList.push("n't")
            } else if (word === "hasn't") {
                alignedWordList.push("has")
                alignedWordList.push("n't")
            } else if (word === "hadn't") {
                alignedWordList.push("had")
                alignedWordList.push("n't")
            } else {
                alignedWordList.push(word)
            }
        }

        this.wordInfo.setWordList(alignedWordList)
    }

    private fixPartsOfSpeech(posInfo: PosInfo, wordInfo: WordInfo): void {
        let posList: number[] = posInfo.getPOSList()
        const wordList: string[] = wordInfo.getWordList()

        for (let i = 0; i < wordList.length; i++) {
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
                i === 0 &&
                posList[i] === PartsOfSpeech.VBD ||
                posList[i] === PartsOfSpeech.VBZ ||
                posList[i] === PartsOfSpeech.VBP ||
                posList[i] === PartsOfSpeech.MD ||
                posList[i] === PartsOfSpeech.TENSE

            )
                // && (
                //         this.isNoun([posList[i + 1], wordList[i + 1]]) ||

                //         (
                //             this.isAdverb([posList[i + 1], wordList[i + 1]])
                //             &&
                //             this.isNoun([posList[i + 2], wordList[i + 2]])
                //         )
                //     )
            ) {
                posList[i] = PartsOfSpeech.QuestionTense
            }
        }

        posInfo.setPOSList(posList)
    }

    private generateClauses(posList: number[], wordList: string[]): void {
        let zippedPairs: [number, string][] = []

        for (let i = 0; i < posList.length; i++) {
            zippedPairs.push([posList[i], wordList[i]])
        }

        let currentPredicate: Verb | null = null

        // baskets to put elements for each clause
        let clauseNouns: Noun[] = []
        let clauseAdjuncts: (Adverb | Preposition)[] = []
        let nounModifiers: string[] = []

        while (zippedPairs.length > 0) {

            let currentPair: [number, string] | undefined = zippedPairs.shift()

            if (currentPair !== undefined) {
                if (this.isNounModifier(currentPair)) {
                    nounModifiers.push(currentPair[1])

                } else if (
                    currentPair[0] === PartsOfSpeech.QuestionTense
                ) {
                    let questionModifier: Adverb = new Adverb(currentPair[1])
                    clauseAdjuncts.push(questionModifier)
                } else if (this.isAdverb(currentPair)) {
                    if (
                        zippedPairs.length > 0 &&
                        this.isPreposition(zippedPairs[0])
                    ) {
                        let prepositionPair: [number, string] =
                            zippedPairs.shift() as [number, string]

                        let currentPreposition: Preposition =
                            new Preposition(prepositionPair[1])
                        currentPreposition.addModifier(currentPair[1])

                        let prepObj: Noun | undefined =
                            this.tagIfObject(zippedPairs)
                        if (prepObj !== undefined) {
                            currentPreposition.setObject(prepObj)
                        }
                        clauseAdjuncts.push(currentPreposition)

                    } else {
                        // else add the adverb to the verb's modifiers:
                        clauseAdjuncts.push(new Adverb(currentPair[1]))
                    }


                } else if (this.isVerb(currentPair, zippedPairs)) {
                    let currentVerb: Verb = new Verb(currentPair[1])
                    if (currentPredicate) {
                        let predName: string = currentPredicate.getName()

                        if (
                            clauseNouns.length > 1 &&
                            Array
                                .from(objectControlVerbs)
                                .some(item => predName.includes(item))
                        ) {
                            let matrixSubject: Noun =
                                clauseNouns.shift() as Noun
                            let matrixObject: Noun = clauseNouns[0]

                            currentPredicate.addNoun(matrixSubject)
                            currentPredicate.addNoun(matrixObject)

                        } else if (
                            clauseNouns.length === 1 &&
                            Array
                                .from(objectControlVerbs)
                                .some(item => predName.includes(item))
                        ) {
                            let matrixSubject: Noun = clauseNouns[0]
                            currentPredicate.addNoun(matrixSubject)
                        } else {

                            if (
                                clauseNouns.length > 1
                            ) {
                                if (

                                    Array
                                        .from(raisingVerbs)
                                        .some(item => predName.includes(item))

                                ) {

                                    let matrixSubject: Noun =
                                        clauseNouns.shift() as Noun
                                    currentPredicate.addNoun(matrixSubject)

                                } else {

                                    let matrixSubject: Noun = clauseNouns[0]
                                    currentPredicate.addNoun(matrixSubject)
                                    let matrixObject: Noun =
                                        clauseNouns.pop() as Noun
                                    currentPredicate.addNoun(matrixObject)
                                }
                            } else {
                                let matrixSubject: Noun = clauseNouns[0]
                                currentPredicate.addNoun(matrixSubject)
                            }
                        }
                    }

                    currentPredicate = currentVerb
                    if (
                        ecmVerbs.has(currentVerb.getName()) &&
                        clauseNouns.length > 0
                    ) {
                        let ecmMatrixNoun: Noun = clauseNouns.shift() as Noun
                        currentVerb.addNoun(ecmMatrixNoun)
                    }
                    this.clauses.push(currentVerb)


                } else if (this.isNoun(currentPair)) {
                    let currentNoun: Noun = new Noun(currentPair[1])
                    if (nounModifiers.length > 0) {
                        currentNoun.addModifier(nounModifiers.pop() as string)
                    }
                    clauseNouns.push(currentNoun)


                } else if (
                    currentPredicate &&
                    this.isConjunction(currentPair)
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
                    this.isPreposition(currentPair) &&
                    currentPredicate
                ) {
                    let currentPreposition: Preposition =
                        new Preposition(currentPair[1])
                    let prepObj: Noun | undefined =
                        this.tagIfObject(zippedPairs)
                    if (prepObj !== undefined) {
                        currentPreposition.setObject(prepObj)
                    }
                    clauseAdjuncts.push(currentPreposition)
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

    // verbs are predicates and predicates are verbs
    private isVerb(
        wordPair: [number, string],
        restOfSent: [number, string][]
    ): boolean {

        let currentPOS: number = wordPair[0]

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
                        restOfSent[0][0] === PartsOfSpeech.NN ||
                        restOfSent[0][0] === PartsOfSpeech.NNS
                    )
                ))
        ) {
            this.numberOfClauses += 1
            return true
        }
        return false
    }

    private isNoun(wordPair: [number, string]): boolean {
        let currentPOS: number = wordPair[0]
        return (currentPOS === PartsOfSpeech.NN ||
            currentPOS === PartsOfSpeech.NNS ||
            currentPOS === PartsOfSpeech.NNP ||
            currentPOS === PartsOfSpeech.NNPS ||
            currentPOS === PartsOfSpeech.PRP ||
            currentPOS === PartsOfSpeech.FW
        )
    }

    private isPreposition(wordPair: [number, string]): boolean {
        let currentPOS: number = wordPair[0]
        return currentPOS === PartsOfSpeech.IN
    }

    private isAdverb(wordPair: [number, string]): boolean {
        let currentPOS: number = wordPair[0]
        return (
            currentPOS === PartsOfSpeech.RB ||
            currentPOS === PartsOfSpeech.RBR ||
            currentPOS === PartsOfSpeech.RBS
        )
    }

    private isConjunction(wordPair: [number, string]): boolean {
        let currentPOS: number = wordPair[0]
        let currentWord: string = wordPair[1]

        return (
            (currentPOS === PartsOfSpeech.IN ||
                currentPOS === PartsOfSpeech.CC ||
                currentPOS === PartsOfSpeech.WR
            ) && (
                conjunctions.has(currentWord)
            )
        )
    }

    private isRelativeClause(wordPair: [number, string]): boolean {
        return false
    }

    private tagIfObject(restOfSent: [number, string][]): Noun | undefined {
        let nounModiferList: string[] = []
        let nextPair: [number, string] | undefined = restOfSent.shift()
        while (nextPair && !this.isNoun(nextPair)) {
            if (this.isNounModifier(nextPair)) {
                nounModiferList.push(nextPair[1])
            }
            nextPair = restOfSent.shift()
        }
        if (nextPair !== undefined) {
            const object: Noun = new Noun(nextPair[1])
            if (nounModiferList.length > 0) {
                for (const modifier of nounModiferList) {
                    object.addModifier(modifier)
                }
            }
            return object
        }
    }

    private isNounModifier(wordPair: [number, string]): boolean {
        let currentPOS: number = wordPair[0]
        return (
            currentPOS === PartsOfSpeech.DT ||
            currentPOS === PartsOfSpeech.PRPQ
        )
    }

    private isVerbModifier(wordPair: [number, string]): boolean {
        return false
    }
}


// identify the subjects and objects that go with each clause

// have to account for things like questions, relative clauses
// also have to make sure that the main predicate is the verb and not progessive or perfective aspects
// also having make/let be in the same clause as the predicate "under" it

// experiencer verbs might be super limited
// determining if intransitive verb is unaccusative or unergative might prove more challenging
// might want to look into an ML model that can classify it or make one yourself

// might want to do stuff for case and agreement on nouns and verbs

// for some reason two empty sentences are being submitted on startup