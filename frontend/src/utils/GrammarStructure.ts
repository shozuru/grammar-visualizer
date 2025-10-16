import type { SentenceInfo } from "./SyntaxMethods"

export class GrammarStructure {

    private numberOfClauses: number
    private wordList: string[]
    private posList: number[]

    constructor(sentInfo: SentenceInfo) {
        this.numberOfClauses = -1
        this.wordList = sentInfo.wordList
        this.posList = sentInfo.posList
    }

    public setNumberOfClauses(num: number): void {
        this.numberOfClauses = num
    }

    public getNumberOfClauses(): number {
        return this.numberOfClauses
    }
}