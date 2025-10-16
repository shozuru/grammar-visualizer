import { PartsOfSpeech } from "./SyntaxConstants"

export interface SentenceInfo {
    wordList: string[]
    posList: number[]
}

const uncontractWords = (sentence: string[]): string[] => {

    let alignedWordList: string[] = []

    for (const word of sentence) {
        if (word === "didn't") {
            alignedWordList.push("did")
            alignedWordList.push("not")
        } else if (word === "doesn't") {
            alignedWordList.push("does")
            alignedWordList.push("not")
        } else if (word === "don't") {
            alignedWordList.push("do")
            alignedWordList.push("not")
        } else {
            alignedWordList.push(word)
        }
    }

    return alignedWordList
}

const addTense = (wordList: string[], posList: number[]): number[] => {

    for (let i = 0; i < wordList.length; i++) {
        if ((wordList[i] === "do" ||
            wordList[i] === "does" ||
            wordList[i] === "did") &&
            wordList[i + 1] == "not") {
            posList[i] = PartsOfSpeech.TENSE
        }
    }

    return posList
}

export const countClauses = (sentence: SentenceInfo) => {

    const modifedWordList = uncontractWords(sentence.wordList)
    const modifedPosList = addTense(modifedWordList, sentence.posList)

    const modedSentInfo: SentenceInfo = {
        wordList: modifedWordList,
        posList: modifedPosList
    }

    let counter: number = 0
    for (const pos of modedSentInfo.posList) {
        if (
            pos === PartsOfSpeech.VB ||
            pos === PartsOfSpeech.VBD ||
            pos === PartsOfSpeech.VBN ||
            pos === PartsOfSpeech.VBP ||
            pos === PartsOfSpeech.VBZ) {

            counter += 1
        }
    }

    return counter
}