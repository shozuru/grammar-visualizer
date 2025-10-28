import { type SentenceInfo } from "./types/SentenceInfo"
import { Sentence } from "./syntax/Sentence"
import type { Pair } from "./types/Pair"

export class GrammarVisualizer {

    public sentence: Sentence
    private sentencePairsList: Pair[]

    constructor(inputSentence: SentenceInfo) {
        this.sentencePairsList = this.createZippedPairs(
            inputSentence.posList,
            inputSentence.wordList
        )

        this.sentence = new Sentence(
            this.sentencePairsList
        )
        this.sentence.generateClauses()

        console.log(
            `Number of clauses in sentence: ${this.sentence.numberOfClauses}`
        )
        console.log(this.sentence.clauses)
    }

    private createZippedPairs(
        listOfPos: number[],
        listOfWords: string[]
    ): Pair[] {
        let zipped: Pair[] = []

        for (let i = 0; i < listOfPos.length; i++) {
            let pair: Pair = {

                pos: listOfPos[i],
                name: listOfWords[i]
            }
            zipped.push(pair)
        }
        return zipped
    }
}

// TODO: questions, relative clauses, adjectives

// the most terrible movie (DT, RBS, JJ, NN) -> (AdvAgr, SUPERLATIVE, RB, NN)
// the most fun movie (DT, JJS, NN, NN) -> (AdvAgr, SUPERLATIVE, RB, NN)
// the longest movie (DT, JJS, NN) -> (AdvAgr, RBS, NN)

// i want to change the pos of 'the' in these cases to AdvAgr
// i want to change NN to RB
// most should be SUPERLATIVE
//  JJS should be RBS
// AdvAgr should go in Adverb agr list while superlative should go in adverb 
// modifier list


// the movie has been watched by (everyone [that is] in the room)
// the amazing movie --> the movie that is amazing
// the movie (that) i saw was really good.
// the person who i knew --> the person that I knew

// account for adjectives
// I made the game (be) easier

// -----------------------------------------------------------------------------
// experiencer verbs might be super limited
// determining if intransitive verb is unaccusative or unergative might prove more challenging
// might want to look into an ML model that can classify it or make one yourself

// might want to do stuff for case and agreement on nouns and verbs

// for some reason two empty sentences are being submitted on startup