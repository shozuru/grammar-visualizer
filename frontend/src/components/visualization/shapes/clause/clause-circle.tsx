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

type ClauseProps = {
    verb: Phrase
    nounList: Noun[]
    adverbList: Adverb[]
}

enum PartOfSpeech {
    NOUN,
    VERB,
    ADVERB
}

type Coupling = {
    type: PartOfSpeech
    value: Phrase
}

const ClauseCircle: React.FC<ClauseProps> =
    ({ verb, nounList, adverbList }) => {

        const radius: number = 56
        const inPhase: Coupling[] = [
            ...nounList.map((noun) =>
                ({ type: PartOfSpeech.NOUN, value: noun })),
            ...adverbList.map((adverb) =>
                ({ type: PartOfSpeech.ADVERB, value: adverb }))
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
            </div>
        )
    }
export default ClauseCircle