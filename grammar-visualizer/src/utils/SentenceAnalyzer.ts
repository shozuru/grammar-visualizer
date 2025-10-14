import { PartsOfSpeech } from "./SyntaxConstants"

export const getPartsOfSpeech = async (sentence: string) => {

    if (sentence.length == 0) {
        return []
    }
    const wordList: string[] = sentence.split(' ')

    var sentencePOSList: PartsOfSpeech[] = []
    wordList.forEach((_, index) => {
        sentencePOSList.push(PartsOfSpeech.ADVERB)
    })
    return sentencePOSList
}