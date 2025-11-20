import { ClauseBuilder } from "./Builders/ClauseBuilder";
import type { Clause } from "./syntax/partsOfSpeech/Clause";
import { PartsOfSpeech } from "./syntax/SyntaxConstants";
import {
    isAdverb, isBeVerb, isNoun, isVerb,
    passiveByPhraseIndex
} from "./syntax/SyntaxMethods";
import type { Word } from "./types/Word";
import { HandlerRegistry } from "./Handlers/HandlerRegistry"

export interface HandlerMethods {
    add: (c: Clause) => void
    push: (cB: ClauseBuilder) => void
    pop: () => ClauseBuilder
    peak: () => ClauseBuilder | undefined

    // need to add for adverbs:
    // The boy that slowly walked went to school quickly
    // ambiguous:
    // the boy that walked [slowly] went to school

}

export class Parser {
    private clauses: Clause[]
    private currentBuilder: ClauseBuilder
    private clausesInProgress: ClauseBuilder[]
    private registry: HandlerRegistry

    private builderStack: ClauseBuilder[]

    constructor() {
        this.clauses = []
        this.builderStack = []
        this.currentBuilder = new ClauseBuilder()
        this.clausesInProgress = []
        this.registry = new HandlerRegistry()
    }

    public parse(wordList: Word[]): Clause[] {

        let fixedWords: Word[] = this.fixPartsOfSpeech(wordList)

        for (let word of fixedWords) {
            console.log(word)
            let handler = this.registry.getHandler(word)

            let ctx: HandlerMethods = {
                add: this.addCompleteClause.bind(this),
                push: this.pushClauseBuilder.bind(this),
                pop: this.popClauseBuilder.bind(this),
                peak: this.peakClauseBuilders.bind(this)
            }

            let newCB: ClauseBuilder | void =
                handler.handle(word, this.currentBuilder, ctx)
            if (newCB) {
                this.currentBuilder = newCB
            }
        }

        let clause: Clause = this.currentBuilder.build()
        this.addCompleteClause(clause)

        return this.clauses
    }

    private fixPartsOfSpeech(wordList: Word[]): Word[] {
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

            if (
                (i === 0 &&
                    (
                        wordList[i].pos === PartsOfSpeech.VBD ||
                        wordList[i].pos === PartsOfSpeech.VBZ ||
                        wordList[i].pos === PartsOfSpeech.VBP ||
                        wordList[i].pos === PartsOfSpeech.MD ||
                        wordList[i].pos === PartsOfSpeech.TENSE
                    )

                ) &&
                (
                    isNoun(
                        {
                            pos: wordList[i + 1].pos,
                            name: wordList[i + 1].name
                        }
                    ) ||
                    (
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

    private addCompleteClause(clause: Clause): void {
        this.clauses.push(clause)
    }

    private peakClauseBuilders(): ClauseBuilder | undefined {
        return this.clausesInProgress.at(-1)
    }

    private pushClauseBuilder(cB: ClauseBuilder): void {
        this.clausesInProgress.push(cB)
    }

    private popClauseBuilder(): ClauseBuilder {
        let cBuilder: ClauseBuilder | undefined = this.clausesInProgress.pop()
        if (!cBuilder) {
            throw ("Tried to pop clause builder that does not exist.")
        }
        return cBuilder
    }
}