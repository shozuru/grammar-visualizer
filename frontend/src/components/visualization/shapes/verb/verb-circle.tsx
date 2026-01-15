import { Adjective }
    from "../../../../grammar-structure/syntax/parts-of-speech/adjectives"
import { Noun } from "../../../../grammar-structure/syntax/parts-of-speech/noun"
import type { Phrase }
    from "../../../../grammar-structure/syntax/parts-of-speech/phrase"
import { Preposition }
    from "../../../../grammar-structure/syntax/parts-of-speech/preposition"
import { Verb } from "../../../../grammar-structure/syntax/parts-of-speech/verb"
import './verb-circle.css'

type PredProp = {
    predicate: Phrase
}

const VerbCircle: React.FC<PredProp> = ({ predicate }) => {
    const getPredName = (phrase: Phrase | null): string => {
        if (!phrase) {
            throw Error("Clause does not have semantic verb")
        }
        if (!(
            phrase instanceof Noun ||
            phrase instanceof Verb ||
            phrase instanceof Preposition ||
            phrase instanceof Adjective
        )) {
            throw Error("pred is not a valid phrase")
        }
        return phrase.getName()
    }

    const predName = getPredName(predicate)

    return (
        <div
            className="verb-wrapper"
        >
            <span
                className="verb-circle"
            />

            <span
                className="verb-name"
            >
                {predName}
            </span>
        </div>
    )
}
export default VerbCircle