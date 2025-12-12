import type { Noun }
    from '../../../../grammar-structure/syntax/parts-of-speech/noun'
import type { Phrase }
    from '../../../../grammar-structure/syntax/parts-of-speech/phrase'
import './clause-circle.css'
import NounCirle from '../noun/noun-circle'
import VerbCircle from '../verb/verb-circle'
import type { Adverb }
    from '../../../../grammar-structure/syntax/parts-of-speech/adverb'
import AdverbCircle from '../adverb/adverb-circle'

type ClauseProps = {
    verb: Phrase
    nounList: Noun[]
    adverbList: Adverb[]
}

const ClauseCircle: React.FC<ClauseProps> =
    ({ verb, nounList, adverbList }) => {

        const radius: number = 56

        return (
            <div
                className="clause-circle"
            >
                <VerbCircle
                    predicate={verb}
                />

                {nounList.map(
                    (noun, i) => (
                        <NounCirle
                            noun={noun}
                            index={i}
                            total={nounList.length}
                            radius={radius}
                            key={i}
                        />
                    )
                )}

                {adverbList.map(
                    (adverb, i) => (
                        <AdverbCircle
                            adverb={adverb}
                        />
                    )
                )}
            </div>
        )
    }
export default ClauseCircle