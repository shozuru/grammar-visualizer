export class WordInfo {

    private wordList: string[]

    constructor(listOfWords: string[]) {
        this.wordList = listOfWords
    }

    public getWordList(): string[] {
        return this.wordList
    }

    public setWordList(wordList: string[]): void {
        this.wordList = wordList
    }
}