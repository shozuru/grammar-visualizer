import { determinerSet, PartsOfSpeech } from "./SyntaxConstants"

const determinePos = (word: string): PartsOfSpeech => {
    if (determinerSet.has(word)) {
        return PartsOfSpeech.DETERMINER
    }

    return PartsOfSpeech.UNKNOWN
}

export const getPartsOfSpeech =
    async (sentence: string): Promise<PartsOfSpeech[]> => {

        if (sentence.length == 0) {
            return []
        }
        const wordList: string[] = sentence.split(' ')
        var sentencePOSList: PartsOfSpeech[] = []

        wordList.forEach((value, _) => {
            const pos: PartsOfSpeech = determinePos(value.toLowerCase())
            sentencePOSList.push(pos)
        })
        return sentencePOSList
    }


// it might just be better to *leverage* some sort of AI model to do this
// then i could move on to visualizing it