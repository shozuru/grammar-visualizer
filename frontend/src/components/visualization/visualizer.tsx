import { Clause } from '../../grammar-structure/syntax/parts-of-speech/clause'
import './visualizer.css'
import type { Predicate } from '../../grammar-structure/syntax/predicate.ts'
import type { Phrase }
    from '../../grammar-structure/syntax/parts-of-speech/phrase.ts'
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

    const getAdverbs = (predicate: Predicate): Adverb[] => {
        const adjunctList: (Preposition | Adverb)[] =
            predicate.getAdjunctStack()
        let adverbList: Adverb[] = []
        for (const adverb of adjunctList) {
            if (adverb instanceof Adverb) {
                adverbList.push(adverb)
            }
        }
        return adverbList
    }

    const getPrepositions = (predicate: Predicate): Preposition[] => {
        const adjunctList: (Preposition | Adverb)[] =
            predicate.getAdjunctStack()
        let prepList: Preposition[] = []
        for (const prep of adjunctList) {
            if (prep instanceof Preposition) {
                prepList.push(prep)
            }
        }
        return prepList
    }

    const getPrepObjs = (prepList: Preposition[]): Noun[] => {
        let nounList: Noun[] = []
        for (const prep of prepList) {
            const object: Noun | null = prep.getObject()
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
                const pred: Predicate = clause.getPredicate()
                // const copula: Verb | null = pred.getCopula()
                const predPhrase: Phrase | null = pred.getSemanticContent()
                if (!predPhrase) {
                    throw Error("Clause does not have a predicate")
                }
                const nounList: Noun[] = clause.getNouns()
                if (nounList.length < 1) {
                    throw Error("Clause has no nouns")
                }

                const adverbList: Adverb[] = getAdverbs(pred)
                const prepositionList: Preposition[] = getPrepositions(pred)
                const prepObjects: Noun[] = getPrepObjs(prepositionList)
                prepObjects.forEach((object) => {
                    nounList.push(object)
                })

                // preposition should be part of main clause, but there 

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