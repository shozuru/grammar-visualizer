import type { Noun }
    from '../../../../grammar-structure/syntax/parts-of-speech/noun'
import { Coupling } from '../utils/coupling'
import NounCirle from '../noun/noun-circle'
import './relative-phrase.css'

type relativeProps = {
    noun: Noun
    index: number
}

const RelativePhrase: React.FC<relativeProps> = ({ noun, index }) => {
    const radius = 32
    const relativizer = noun.getRelativizer()
    if (!relativizer) {
        throw Error("noun is not associated with relative clause")
    }
    return (
        <div
            className='relative-phrase'
        >
            <NounCirle
                noun={noun}
                coupling={Coupling.INPHASE}
                angle={-10}
                radius={radius}
                key={`relPhrase-noun-${index}`}
            />

            <NounCirle
                noun={relativizer}
                coupling={Coupling.INPHASE}
                angle={10}
                radius={radius}
                key={`relPhrase-rel-${index}`} />
        </div>
    )
}
export default RelativePhrase