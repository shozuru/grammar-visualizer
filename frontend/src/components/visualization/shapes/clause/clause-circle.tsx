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

enum PartOfSpeech {
    NOUN,
    VERB,
    ADVERB
}

export enum Coupling {
    INPHASE,
    ANTIPHASE
}

type ClauseProps = {
    verb: Phrase
    nounList: Noun[]
    adverbList: Adverb[]
}

type CoupledElement = {
    type: PartOfSpeech
    value: Phrase
}

const ClauseCircle: React.FC<ClauseProps> =
    ({ verb, nounList, adverbList }) => {

        const radius: number = 56
        const inPhase: CoupledElement[] = [
            ...nounList.slice(0, 1).map((noun) =>
                ({ type: PartOfSpeech.NOUN, value: noun })),
            ...adverbList.map((adverb) =>
                ({ type: PartOfSpeech.ADVERB, value: adverb }))
        ]

        const antiPhase: CoupledElement[] = [
            ...nounList.slice(1).map(noun => (
                { type: PartOfSpeech.NOUN, value: noun }
            ))
        ]

        const arcSpan: number = 45
        const half: number = arcSpan / 2
        let angles: number[] = inPhase.map((_, i) =>
            -half + (i / (inPhase.length - 1 || 1)) * arcSpan
        )

        const minSeparation: number = 10
        const smallest: number = Math.min(...angles.map(a => Math.abs(a)))

        if (smallest < minSeparation) {
            const shift: number = smallest >= 0
                ? minSeparation - smallest
                : -(minSeparation - smallest)

            angles = angles.map(a => a + shift)
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
                        item.value instanceof Noun
                    )) {
                        throw Error(`${item.type} is not a valid object.`)
                    }

                    const angle: number = angles[i]
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
                    return (
                        <AdverbCircle
                            adverb={item.value}
                            angle={angle}
                            radius={radius}
                            key={`adverb-${i}`}
                        />
                    )
                })}

                {antiPhase.map((noun, i) => {
                    if (!(noun.value instanceof Noun)) {
                        throw Error("Antiphase item is not a noun")
                    }
                    return (
                        <NounCirle
                            noun={noun.value}
                            coupling={Coupling.ANTIPHASE}
                            angle={180}
                            radius={radius}
                            key={`noun-${i}`}
                        />
                    )
                })}
            </div>
        )
    }
export default ClauseCircle