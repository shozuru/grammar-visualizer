export class Sentence {

    private posInfo: number[]
    private wordInfo: string[]


    constructor(posInfo: number[], wordInfo: string[]) {
        this.posInfo = posInfo
        this.wordInfo = wordInfo
    }

    public getPosInfoList(): number[] {
        return this.posInfo
    }

    public setPosInfoList(posList: number[]): void {
        this.posInfo = posList
    }

    public getWordInfoList(): string[] {
        return this.wordInfo
    }

    public setWordInfoList(wordList: string[]): void {
        this.wordInfo = wordList
    }
}