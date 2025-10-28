import {
    addCaustiveModifier, addMatrixClauseArguments,
    addMatrixClauseMods,
    createNounPhrase, createPrepositionalPhrase, fixPartsOfSpeech,
    isAdverb, isAdverbAgr, isAdverbMod, isBeVerb, isCausative, isConjunction,
    isNoun, isNounModifier, isPassive, isPreposition, isRelative, isVerb,
    isVerbAgr, isVerbModifier, removeAgr, resolveAdverbAttachment,
} from "./SyntaxMethods"
import { Adverb } from "./partsOfSpeech/Adverb"
import { Noun } from "./partsOfSpeech/Noun"
import { Preposition } from "./partsOfSpeech/Preposition"
import { Verb } from "./partsOfSpeech/Verb"
import { PartsOfSpeech, } from "./SyntaxConstants"
import type { Pair } from "../types/Pair"
import { Clause } from "./partsOfSpeech/Clause"
import { Mod } from "./Mod"
import { Agr } from "./Agr"
import { Predicate } from "./Predicate"
import { Relativize } from "./Relativize"

export class Sentence {

    // list of completed clauses
    public clauses: Clause[]
    public numberOfClauses: number

    private wordPairs: Pair[]

    private currentPredicate: Predicate | null
    private predModStack: Mod[]
    private predAgrStack: Agr[]

    private nounStack: Noun[]
    private nounModStack: Mod[]
    private nounAgrStack: Pair[]

    private adjunctStack: (Preposition | Adverb)[]
    private adverbModStack: Mod[]
    private adverbAgrStack: Agr[]

    constructor(pairList: Pair[]) {
        this.wordPairs = fixPartsOfSpeech(pairList)

        this.clauses = []
        this.numberOfClauses = 0
        this.wordPairs = pairList

        this.currentPredicate = null
        this.predAgrStack = []
        this.predModStack = []

        this.nounStack = []
        this.nounModStack = []
        this.nounAgrStack = []

        this.adjunctStack = []
        this.adverbAgrStack = []
        this.adverbModStack = []
    }

    public generateClauses(): void {

        while (this.wordPairs.length > 0) {

            let currentPair: Pair | undefined = this.wordPairs.shift()
            console.log(currentPair)

            if (currentPair !== undefined) {
                if (isNounModifier(currentPair, this.wordPairs)) {
                    this.nounModStack.push(new Mod(currentPair))

                } else if (isAdverbMod(currentPair)) {
                    this.adverbModStack.push(new Mod(currentPair))

                } else if (isAdverbAgr(currentPair)) {
                    this.adverbAgrStack.push(new Agr(currentPair))

                } else if (isVerbModifier(currentPair)) {
                    this.predModStack.push(new Mod(currentPair))

                } else if (isVerbAgr(currentPair)) {
                    this.predAgrStack.push(new Agr(currentPair))

                } else if (
                    this.nounStack.length > 0 &&
                    isCausative(currentPair)
                ) {
                    let agentNoun: Noun = this.nounStack.pop() as Noun
                    this.nounStack.push(
                        addCaustiveModifier(agentNoun, currentPair)
                    )
                } else if (
                    isPassive(currentPair)
                ) {
                    this.nounModStack.push(new Mod(currentPair))
                } else if (
                    currentPair.pos === PartsOfSpeech.QuestionTense
                ) {
                    let questionModifier: Adverb = new Adverb(currentPair.name)
                    this.adjunctStack.push(questionModifier)

                } else if (isAdverb(currentPair)) {
                    this.addModsIfPresent(currentPair)

                    let currentAdverb: Adverb = new Adverb(currentPair.name)
                    this.handleAdverbModsAndArgs(currentAdverb)
                    let modPhrase: Preposition | Adverb =
                        resolveAdverbAttachment(
                            currentAdverb,
                            this.wordPairs
                        )

                    if (this.currentPredicate &&
                        isBeVerb(
                            this.currentPredicate
                                .getVerb()
                                .getName()
                        )
                    ) {
                        this.currentPredicate.setSemanticElement(
                            modPhrase
                        )
                    } else {
                        this.adjunctStack.push(modPhrase)
                    }

                } else if (isVerb(currentPair)) {
                    if (this.currentPredicate !== null) {
                        this.handleMatrixClause(this.currentPredicate)
                    }

                    let vPhrase: Verb = new Verb(currentPair.name)
                    this.currentPredicate = new Predicate(vPhrase)
                    this.numberOfClauses += 1
                    this.handlePreVerbAgrs()

                } else if (isNoun(currentPair)) {
                    let nPhrase: Noun =
                        createNounPhrase(
                            currentPair,
                            this.nounModStack
                        )
                    this.checkForRelativeClause(nPhrase)

                    if (this.currentPredicate &&
                        isBeVerb(
                            this.currentPredicate
                                .getVerb()
                                .getName()
                        )
                    ) {
                        this.currentPredicate.setSemanticElement(
                            nPhrase
                        )
                    } else {
                        this.nounStack.push(nPhrase)
                    }

                } else if (
                    isPreposition(currentPair) &&
                    this.currentPredicate
                ) {
                    let pPhrase: Preposition =
                        createPrepositionalPhrase(
                            currentPair,
                            this.wordPairs
                        )

                    if (this.currentPredicate &&
                        isBeVerb(
                            this.currentPredicate
                                .getVerb()
                                .getName()
                        )
                    ) {
                        this.currentPredicate.setSemanticElement(
                            pPhrase
                        )
                    } else {
                        this.adjunctStack.push(pPhrase)
                    }


                }
                // else if (
                //     this.currentPredicate &&
                //     isConjunction(currentPair)
                // ) {
                //     let completeClause: Clause = new Clause()

                //     for (const noun of this.nounStack) {
                //         completeClause.addNounToClause(noun)
                //     }
                //     for (const modifier of this.adjunctStack) {
                //         completeClause.addAdjunct(modifier)
                //     }

                //     this.nounStack = []
                //     this.adjunctStack = []
                //     this.currentPredicate = null
                //     this.predAgrStack = []
                // }
            }
        }

        if (this.currentPredicate) {

            let completeClause: Clause = new Clause(this.currentPredicate)

            for (const noun of this.nounStack) {
                if (noun.getModifiers().some(
                    mod =>
                        mod.getName() === "made" ||
                        mod.getName() === "make" ||
                        mod.getName() === "let")
                ) {
                    completeClause.setCausativeNoun(noun)
                } else {
                    completeClause.addNounToClause(noun)
                }
            }
            for (const adjunct of this.adjunctStack) {
                completeClause.addAdjunct(adjunct)
            }

            for (const mod of this.predModStack) {
                completeClause.addPredMod(mod)
            }

            for (const agr of this.predAgrStack) {
                completeClause.addPredAgr(agr)
            }

            this.clauses.push(completeClause)
        }
    }

    private handleMatrixClause(currentPred: Predicate): void {
        this.clauses.push(
            addMatrixClauseArguments(
                currentPred,
                this.nounStack
            )
        )
        addMatrixClauseMods(
            currentPred,
            this.predModStack,
        )
        this.predModStack.push(new Mod(
            { name: "inf", pos: PartsOfSpeech.VBINF }
        ))
    }

    private handlePreVerbAgrs(): void {
        if (this.currentPredicate) {
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
    }

    private handleAdverbModsAndArgs(adverb: Adverb): void {
        if (
            this.adverbModStack.length > 0
        ) {
            for (const modifier of this.adverbModStack) {
                adverb.addModifier(modifier)
            }
        }
        if (
            this.adverbAgrStack.length > 0
        ) {
            for (const agr of this.adverbAgrStack) {
                adverb.addAdverbAgr(agr)
            }
        }
    }

    private addModsIfPresent(adverbPair: Pair): void {
        if (adverbPair.pos === PartsOfSpeech.RBS) {
            this.adverbModStack.push(
                new Mod(
                    {
                        name: "superlative",
                        pos: PartsOfSpeech.SUPERLATIVE
                    }
                )
            )
        } else if (adverbPair.pos === PartsOfSpeech.RBR) {
            this.adverbModStack.push(
                new Mod(
                    {
                        name: "comparative",
                        pos: PartsOfSpeech.COMPARATIVE
                    }
                )
            )
        }
    }

    private checkForRelativeClause(currentNoun: Noun): void {
        if (isRelative(this.wordPairs[0])) {
            let relPair: Pair = this.wordPairs.shift() as Pair
            let relSystem: Relativize = new Relativize(relPair.name)
            currentNoun.setRelativizer(relSystem)
            if (isVerb(this.wordPairs[0])) {
                let relVerbPair: Pair = this.wordPairs.shift() as Pair
                let relVerb: Verb = new Verb(relVerbPair.name)
                let relPred: Predicate = new Predicate(relVerb)
                let relClause: Clause = new Clause(relPred)
                relClause.addNounToClause(relSystem)
                this.clauses.push(relClause)
            }
        }
    }
}