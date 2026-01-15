import { Clause } from '../../grammar-structure/syntax/parts-of-speech/clause'
import './visualizer.css'
import type { Predicate } from '../../grammar-structure/syntax/predicate.ts'
import { Noun } from '../../grammar-structure/syntax/parts-of-speech/noun.ts'
import { Preposition }
    from '../../grammar-structure/syntax/parts-of-speech/preposition.ts'
import { Adverb }
    from '../../grammar-structure/syntax/parts-of-speech/adverb.ts'
import ClauseCircle from './shapes/clause/clause-circle.tsx'

type VisualProps = {
    clauseList: Clause[]
}

const Visualizer: React.FC<VisualProps> = ({ clauseList }) => {

    console.log(clauseList)

    const getAdverbsFrom = (predicate: Predicate): Adverb[] => {
        const adjunctList = predicate.getAdjunctStack()
        let adverbList: Adverb[] = []
        for (const adverb of adjunctList) {
            if (adverb instanceof Adverb) {
                adverbList.push(adverb)
            }
        }
        return adverbList
    }

    const getPrepositionsFrom = (predicate: Predicate): Preposition[] => {
        const adjunctList = predicate.getAdjunctStack()
        let prepList: Preposition[] = []
        for (const prep of adjunctList) {
            if (prep instanceof Preposition) {
                prepList.push(prep)
            }
        }
        return prepList
    }

    const getPrepObjsFrom = (prepList: Preposition[]): Noun[] => {
        let nounList: Noun[] = []
        for (const prep of prepList) {
            const object = prep.getObject()
            if (object) {
                nounList.push(object)
            }
        }
        return nounList
    }

    return (
        <div
            className='visual-container'
        >
            {clauseList.map((clause, i) => {
                const pred = clause.getPredicate()
                // const copula: Verb | undefined = pred.getCopula()
                const predPhrase = pred.getSemanticContent()
                if (!predPhrase) {
                    throw Error("Clause does not have a predicate")
                }
                const nounList = clause.getNouns()
                // if (nounList.length < 1) {
                //     throw Error("Clause has no nouns")
                // }
                const adverbList = getAdverbsFrom(pred)
                const prepositionList = getPrepositionsFrom(pred)
                // const prepObjects: Noun[] = getPrepObjsFrom(prepositionList)

                // in react, make sure to create a new variable instead of 
                // manipulating old data... react doesn't always handle it well
                // const updatedNounList = [...nounList, ...prepObjects]

                return (
                    <div
                        className='clause-container'
                        key={i}
                    >
                        <ClauseCircle
                            verb={predPhrase}
                            nounList={nounList}
                            adverbList={adverbList}
                            prepList={prepositionList}
                        />
                    </div>
                )
            })}
        </div >
    )
}

export default Visualizer