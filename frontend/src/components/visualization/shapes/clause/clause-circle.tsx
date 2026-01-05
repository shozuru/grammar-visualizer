import { Noun }
    from '../../../../grammar-structure/syntax/parts-of-speech/noun'
import type { Phrase }
    from '../../../../grammar-structure/syntax/parts-of-speech/phrase'
import './clause-circle.css'
import NounCirle from '../noun/noun-circle'
import VerbCircle from '../verb/verb-circle'
import { Adverb }
    from '../../../../grammar-structure/syntax/parts-of-speech/adverb'
import AdverbCircle from '../adverb/adverb-circle'
import { Preposition }
    from '../../../../grammar-structure/syntax/parts-of-speech/preposition'
import PrepositionCircle from '../preposition/preposition-circle'

enum PartOfSpeech {
    NOUN,
    VERB,
    ADVERB,
    PREPOSITION
}

export enum Coupling {
    INPHASE,
    ANTIPHASE
}

type ClauseProps = {
    verb: Phrase
    nounList: Noun[]
    adverbList: Adverb[]
    prepList: Preposition[]
}

type CoupledElement = {
    type: PartOfSpeech
    value: Phrase
}

const ClauseCircle: React.FC<ClauseProps> =
    ({ verb, nounList, adverbList, prepList }) => {

        console.log(nounList.length)

        function distributeAngles(
            count: number,
            arcSpan: number,
            centerOffset: number
        ): number[] {
            if (count === 1) return [centerOffset]
            const step: number = arcSpan / (count - 1)
            const start: number = centerOffset - arcSpan / 2
            return Array.from({ length: count }, (_, i) => start + i * step)
        }

        const radius: number = 56
        const inPhase: CoupledElement[] = [
            ...nounList.slice(0, 1).map((noun) =>
                ({ type: PartOfSpeech.NOUN, value: noun })),
            ...adverbList.map((adverb) =>
                ({ type: PartOfSpeech.ADVERB, value: adverb })),
            ...prepList.map((prep) =>
                ({ type: PartOfSpeech.PREPOSITION, value: prep }))
        ]

        const antiPhase: CoupledElement[] = [
            ...nounList.slice(1).map(noun => (
                { type: PartOfSpeech.NOUN, value: noun }
            ))
        ]

        const arcSpan: number = 45
        const minSeparation: number = 10

        let inPhaseAngles: number[] = distributeAngles(
            inPhase.length,
            arcSpan,
            +minSeparation
        )
        let antiPhaseAngles: number[] = distributeAngles(
            antiPhase.length,
            arcSpan,
            180
        )

        const smallestIn: number =
            Math.min(...inPhaseAngles.map(a => Math.abs(a)))
        const smallestAnti: number =
            Math.min(...antiPhaseAngles.map(a => Math.abs(a)))

        if (smallestIn < minSeparation) {
            const shift: number = smallestIn >= 0
                ? minSeparation - smallestIn
                : -(minSeparation - smallestIn)

            inPhaseAngles = inPhaseAngles.map(a => a + shift)
        }

        if (smallestAnti < minSeparation) {
            const shift: number = smallestAnti >= 0
                ? minSeparation - smallestAnti
                : -(minSeparation - smallestAnti)

            antiPhaseAngles = antiPhaseAngles.map(a => a + shift)
        }

        return (
            <div
                className="clause-circle"
            >
                <VerbCircle
                    predicate={verb}
                />

                {inPhase.map((item, i) => {
                    if (!(item.value instanceof Adverb ||
                        item.value instanceof Noun ||
                        item.value instanceof Preposition
                    )) {
                        throw Error(`${item.type} is not a valid object.`)
                    }

                    const angle: number = inPhaseAngles[i]
                    if (item.value instanceof Noun) {
                        return (
                            <NounCirle
                                noun={item.value}
                                coupling={Coupling.INPHASE}
                                angle={angle}
                                radius={radius}
                                key={`noun-${i}`}
                            />
                        )
                    }
                    if (item.value instanceof Adverb) {
                        return (
                            <AdverbCircle
                                adverb={item.value}
                                angle={angle}
                                radius={radius}
                                key={`adverb-${i}`}
                            />
                        )
                    }
                    if (item.value instanceof Preposition) {
                        return (
                            <PrepositionCircle
                                prep={item.value}
                                angle={angle}
                                radius={radius}
                                key={`prep-${i}`}
                            />
                        )
                    }
                })}

                {antiPhase.map((noun, i) => {
                    if (!(noun.value instanceof Noun)) {
                        throw Error("Antiphase item is not a noun")
                    }
                    const angle: number = antiPhaseAngles[i]
                    return (
                        <NounCirle
                            noun={noun.value}
                            coupling={Coupling.ANTIPHASE}
                            angle={angle}
                            radius={radius}
                            key={`noun-${i}`}
                        />
                    )
                })}
            </div>
        )
    }
export default ClauseCircle