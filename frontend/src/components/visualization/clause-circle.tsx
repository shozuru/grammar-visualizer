import type { Noun } from '../../grammar-structure/syntax/parts-of-speech/noun'
import type { Phrase }
    from '../../grammar-structure/syntax/parts-of-speech/phrase'
import './clause-circle.css'
import NounCirle from './shapes/noun-circle'
import VerbCircle from './verb-circle'

type ClauseProps = {
    verb: Phrase
    nounList: Noun[]
}

const ClauseCircle: React.FC<ClauseProps> = ({ verb, nounList }) => {
    const radius: number = 80

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

        </div>
    )
}
export default ClauseCircle