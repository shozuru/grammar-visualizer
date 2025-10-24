import { type SentenceInfo } from "./types/SentenceInfo"
import { Sentence } from "./syntax/Sentence"

export class GrammarVisualizer {

    public sentence: Sentence

    constructor(inputSentence: SentenceInfo) {
        this.sentence = new Sentence(
            inputSentence.posList,
            inputSentence.wordList
        )

        this.sentence.uncontractSent() // experiment with not doing this 
        this.sentence.generateClauses()

        console.log(
            `Number of clauses in sentence: ${this.sentence.numberOfClauses}`
        )
        console.log(this.sentence.clauses)

        console.log("below is the new clause class version")
        console.log(this.sentence.new_clauses)
    }
}


// identify the subjects and objects that go with each clause

// account for things like questions, relative clauses, passive, causative 
// make sure that the main predicate is the verb and not progessive or perfective aspects

// experiencer verbs might be super limited
// determining if intransitive verb is unaccusative or unergative might prove more challenging
// might want to look into an ML model that can classify it or make one yourself

// might want to do stuff for case and agreement on nouns and verbs

// for some reason two empty sentences are being submitted on startup