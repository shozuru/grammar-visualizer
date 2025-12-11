// import Circle from './shapes/circle/circle.tsx'
import { Clause } from '../../grammar-structure/syntax/parts-of-speech/clause'
import './visualizer.css'
import type { Predicate } from '../../grammar-structure/syntax/predicate.ts'
import { Verb } from '../../grammar-structure/syntax/parts-of-speech/verb.ts'
import type { Phrase }
    from '../../grammar-structure/syntax/parts-of-speech/phrase.ts'
import { Noun } from '../../grammar-structure/syntax/parts-of-speech/noun.ts'
import { Preposition }
    from '../../grammar-structure/syntax/parts-of-speech/preposition.ts'
import { Adjective }
    from '../../grammar-structure/syntax/parts-of-speech/adjectives.ts'
import { Adverb }
    from '../../grammar-structure/syntax/parts-of-speech/adverb.ts'
import NounCirle from './shapes/noun-circle.tsx'

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
                const verbName: string = getPredName(predPhrase)

                const adverbList: Adverb[] = getAdverbs(pred)
                const prepositionList: Preposition[] = getPrepositions(pred)
                const prepObjects: Noun[] = getPrepObjs(prepositionList)

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
                                            className='noun-container'
                                            key={i}
                                        >
                                            <NounCirle
                                                noun={noun} />
                                        </div>
                                    )
                                )}
                            </div>

                            <div
                                className='verb'
                            >
                                {verbName}
                            </div>

                            {adverbList.map(
                                (adverb, i) => (
                                    <>
                                        <div
                                            key={i}
                                            className='adverb'
                                        >
                                            {adverb.getName()}
                                        </div>
                                    </>
                                )
                            )}

                            {prepObjects.map(
                                (noun, i) => (
                                    <>
                                        <div
                                            key={i}
                                            className='noun'
                                        >
                                            {noun.getName()}
                                        </div>
                                    </>
                                )
                            )}

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