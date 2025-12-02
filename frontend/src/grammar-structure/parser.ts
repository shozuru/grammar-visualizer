import { ClauseBuilder } from "./builders/clause-builder";
import type { Clause } from "./syntax/parts-of-speech/clause";
import { PartsOfSpeech } from "./syntax/syntax-constants";
import {
    isAdverb, isBeVerb, isNominal, isNoun, isVerb, passiveByPhraseIndex
} from "./syntax/syntax-methods";
import type { Word } from "./types/word";
import { HandlerRegistry } from "./handlers/handler-registry"

export interface HandlerMethods {
    add: (c: Clause) => void
    push: (cB: ClauseBuilder) => void
    pop: () => ClauseBuilder
    peak: () => ClauseBuilder | undefined
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

        const fixedWords: Word[] = this.fixPartsOfSpeech(wordList)

        for (const word of fixedWords) {
            console.log(word)
            // debugger
            const handler = this.registry.getHandler(word)

            const ctx: HandlerMethods = {
                add: this.addCompleteClause.bind(this),
                push: this.pushClauseBuilder.bind(this),
                pop: this.popClauseBuilder.bind(this),
                peak: this.peakClauseBuilders.bind(this)
            }

            const newCB: ClauseBuilder | void =
                handler.handle(word, this.currentBuilder, ctx)

            if (newCB) {
                this.currentBuilder = newCB
            }
        }

        const clause: Clause = this.currentBuilder.build()
        this.addCompleteClause(clause)
        return this.clauses
    }

    private fixPartsOfSpeech(wordList: Word[]): Word[] {
        for (let i = 0; i < wordList.length; i++) {
            this.handleWordItem(wordList, i)
        }
        return wordList
    }

    private handleWordItem(wordList: Word[], i: number): void {
        this.handleContractions(wordList, i)
        this.handlePerfect(wordList, i)
        this.handlePassive(wordList, i)
        this.handleQTense(wordList, i)
        this.handleCausative(wordList, i)
        this.handleSuperlative(wordList, i)
        this.handleNonFinite(wordList, i)
        this.handleNegation(wordList, i)
        this.handlePronouns(wordList, i)
        this.handleWHWords(wordList, i)
    }

    private handleWHWords(wordList: Word[], i: number): void {
        if (i !== 0) return
        const current: Word = wordList[i]
        const pos: number = current.pos
        if (pos === PartsOfSpeech.WP) {
            current.pos = PartsOfSpeech.WHNoun
        } else if (pos === PartsOfSpeech.WR) {
            current.pos = PartsOfSpeech.WHAdverb
        }
        this.handleTensePromotion(wordList, i)
    }

    private handleTensePromotion(wordList: Word[], i: number): void {
        const secondWord: Word = wordList[i + 1]
        const thirdWord: Word = wordList[i + 2]

        if (!isNominal(thirdWord)) return
        if (secondWord.name === 'do') {
            secondWord.pos = PartsOfSpeech.PRESENT
        } else if (secondWord.name === 'did') {
            secondWord.pos = PartsOfSpeech.PAST
        }
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
        const cBuilder: ClauseBuilder | undefined = this.clausesInProgress.pop()
        if (!cBuilder) {
            throw ("Tried to pop clause builder that does not exist.")
        }
        return cBuilder
    }

    private handlePassive(wordList: Word[], i: number) {
        // the presence of a 'by', in which the BE is just a form of agr
        // the presence of BE + VBN, without 'by'

        // if we see BE + VBN, tag it first as impersonal
        // if we also see a by phrase, then we change it to agr

        if (isBeVerb(wordList[i].name)) {
            let j: number = i + 1
            if (wordList[j].pos === PartsOfSpeech.RB) {
                j += 1
            }
            if (wordList[j] && wordList[j].pos === PartsOfSpeech.VBN) {
                wordList[i].pos = PartsOfSpeech.IMPERSONAL

                const index: number =
                    passiveByPhraseIndex(wordList.slice(j))

                if (index >= 0) {
                    wordList[j + index].pos = PartsOfSpeech.PASSIVE
                    wordList[i].pos = PartsOfSpeech.PsvAgr
                }
            }
        }
    }

    private handleContractions(wordList: Word[], i: number): void {
        const current: Word = wordList[i]

        const negDO: string[] = [
            "don't", "doesn't", "didn't"
        ]

        if (
            negDO.includes(current.name) &&
            current.pos === PartsOfSpeech.RB
        ) {
            current.pos = PartsOfSpeech.NEGATION
            return
        }

        const presDO: string[] = ["do", "does", "did"]
        const neg: string[] = ["n't", "not"]
        if (!wordList[i + 1]) return

        const next: Word = wordList[i + 1]
        if (!(presDO.includes(current.name) &&
            neg.includes(next.name)
        )) return

        wordList[i].pos = PartsOfSpeech.TENSE
        if (next.name === "not") {
            next.pos = PartsOfSpeech.NEGATION
        }
    }

    private handlePerfect(wordList: Word[], i: number): void {
        const current: Word = wordList[i]
        const perfectList: string[] = ["have", "has", "had"]
        if (!(
            perfectList.includes(current.name) &&
            wordList[i + 1]
        )) return

        if (wordList[i + 1].pos === PartsOfSpeech.RB) {
            current.pos = PartsOfSpeech.PERFECTIVE
        }
        else if (wordList[i + 1].pos == PartsOfSpeech.VBN) {
            current.pos = PartsOfSpeech.PERFECTIVE
        }
    }

    private handleQTense(wordList: Word[], i: number): void {
        if (i !== 0) return
        if (!wordList[i + 1]) return

        const current: Word = wordList[i]
        const next: Word = wordList[i + 1]
        const tenseList: number[] = [
            PartsOfSpeech.VBD, PartsOfSpeech.VBZ, PartsOfSpeech.VBP,
            PartsOfSpeech.MD, PartsOfSpeech.TENSE
        ]

        if (!tenseList.includes(current.pos)) return
        if (this.isNoun(next) || (
            wordList[i + 2] &&
            this.isAdverb(next) &&
            isNoun(wordList[i + 2])
        )) {
            wordList[i].pos = PartsOfSpeech.QTense
        }
    }

    private isNoun(word: Word): boolean {
        return isNoun(
            {
                pos: word.pos,
                name: word.name
            }
        )
    }

    private isAdverb(word: Word): boolean {
        return isAdverb(
            {
                pos: word.pos,
                name: word.name
            }
        )
    }

    private handleCausative(wordList: Word[], i: number): void {
        const causList: string[] = ["make", "made", "let"]
        const current = wordList[i]

        if (causList.includes(current.name) &&
            wordList
                .slice(i)
                .some(word => word.pos === PartsOfSpeech.VB)
        ) {
            current.pos = PartsOfSpeech.CAUSATIVE
        }
    }

    private handleSuperlative(wordList: Word[], i: number): void {
        if (!wordList[i + 1]) return

        const superList: number[] = [PartsOfSpeech.RBS, PartsOfSpeech.JJS]

        const current: Word = wordList[i]
        const next: Word = wordList[i + 1]

        if (current.pos === PartsOfSpeech.DT && superList.includes(next.pos)) {
            current.pos = PartsOfSpeech.AdvAgr
            if (next.name === "most") {
                next.pos = PartsOfSpeech.SUPERLATIVE
            }
        } else if (
            current.pos === PartsOfSpeech.SUPERLATIVE &&
            next.pos === PartsOfSpeech.NN
        ) {
            next.pos = PartsOfSpeech.RB
        }
    }

    private handleNonFinite(wordList: Word[], i: number): void {
        const current: Word = wordList[i]
        if (!(current.pos === PartsOfSpeech.TO &&
            current.name === "to"
        )) return
        current.pos = PartsOfSpeech.InfAgr
    }

    private handleNegation(wordList: Word[], i: number): void {
        const current: Word = wordList[i]
        if (!(
            current.pos === PartsOfSpeech.RB &&
            current.name === "not"
        )) return
        current.pos = PartsOfSpeech.NEGATION
    }

    private handlePronouns(wordList: Word[], i: number): void {
        if (!wordList[i + 1]) return
        const current: Word = wordList[i]
        const next: Word = wordList[i + 1]

        if (!(
            current.pos === PartsOfSpeech.DT &&
            isVerb(next)
        )) return
        current.pos = PartsOfSpeech.PRP
    }
}