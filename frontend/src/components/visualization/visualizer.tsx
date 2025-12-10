import Circle from './shapes/circle/circle.tsx'
import { Clause } from '../../grammar-structure/syntax/parts-of-speech/clause'
import './visualizer.css'
import type { Predicate } from '../../grammar-structure/syntax/predicate.ts'
import { Verb } from '../../grammar-structure/syntax/parts-of-speech/verb.ts'
import type { Phrase } from '../../grammar-structure/syntax/parts-of-speech/phrase.ts'
import { Noun } from '../../grammar-structure/syntax/parts-of-speech/noun.ts'
import { Preposition } from '../../grammar-structure/syntax/parts-of-speech/preposition.ts'
import { Adjective } from '../../grammar-structure/syntax/parts-of-speech/adjectives.ts'

type VisualProps = {
    clauseList: Clause[]
}

const Visualizer: React.FC<VisualProps> = ({ clauseList }) => {
    console.log(clauseList)

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

    return (
        <div
            className='visual-container'
        >
            {clauseList.map((clause, i) => {
                const pred: Predicate = clause.getPredicate()
                const copula: Verb | null = pred.getCopula()
                const predPhrase: Phrase | null = pred.getSemanticContent()
                const verbName: string = getPredName(predPhrase)

                return (

                    <div
                        className='clause-container'
                        key={i}
                    >
                        <div
                            className='clause'
                        >
                            <div
                                className='noun-container'
                            >
                                {clause.getNouns().map(
                                    (noun, i) => (
                                        <div
                                            className='noun'
                                            key={i}
                                        >
                                            {noun.getName()}
                                        </div>
                                    )
                                )}
                            </div>
                            <div
                                className='verb'
                            >
                                {verbName}
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* {Array.from({ length: clauseList.length }).map((_, i) => (
                <Circle
                    key={i}
                />
            ))} */}
        </div >
    )
}

export default Visualizer