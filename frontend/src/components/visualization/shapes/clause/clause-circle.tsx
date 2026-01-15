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
import PrepositionCircle
    from '../preposition-phrase/preposition/preposition-circle'
import PrepositionPhrase from '../preposition-phrase/preposition-phrase'
import RelativePhrase from '../relative/relative-phrase'
import { Coupling } from '../utils/coupling'

enum PartOfSpeech {
    NOUN,
    VERB,
    ADVERB,
    PREPOSITION
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

        const relativizerList: Noun[] = []
        for (const noun of nounList) {
            if (noun.getRelativizer()) {
                relativizerList.push(noun)
            }
        }

        const prepsWithObjects: Preposition[] = []
        for (const prep of prepList) {
            if (!prep.hasObject()) continue
            prepsWithObjects.push(prep)
        }

        function distributeAngles(
            count: number,
            arcSpan: number,
            centerOffset: number
        ): number[] {
            if (count === 1) return [centerOffset]
            const step = arcSpan / (count - 1)
            const start = centerOffset - arcSpan / 2
            return Array.from({ length: count }, (_, i) => start + i * step)
        }

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

        const radius = 56
        const arcSpan = 45
        const minSeparation = 10

        let inPhaseAngles = distributeAngles(
            inPhase.length,
            arcSpan,
            0
        )
        let antiPhaseAngles = distributeAngles(
            antiPhase.length,
            arcSpan,
            180
        )

        const adjustSeparation = (
            angles: number[],
            minSeparation: number
        ): number[] => {
            const smallestAngle = Math.min(...angles.map(a => Math.abs(a)))
            if (smallestAngle < minSeparation) {
                const shift = smallestAngle >= 0
                    ? minSeparation - smallestAngle
                    : -(minSeparation - smallestAngle)
                return angles.map(a => a + shift)
            }
            return angles
        }

        inPhaseAngles = adjustSeparation(inPhaseAngles, minSeparation)
        antiPhaseAngles = adjustSeparation(antiPhaseAngles, minSeparation)

        return (
            <>
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
                </div >


                {prepsWithObjects.length > 0 &&
                    prepList.map((prep, i) =>
                        <PrepositionPhrase
                            preposition={prep}
                            index={i}
                        />
                    )
                }

                {relativizerList.length > 0 &&
                    relativizerList.map((noun, i) =>
                        <RelativePhrase
                            noun={noun}
                            index={i}
                        />
                    )}
            </>
        )
    }
export default ClauseCircle