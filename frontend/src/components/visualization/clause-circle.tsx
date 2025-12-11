import type { Phrase } from '../../grammar-structure/syntax/parts-of-speech/phrase'
import './clause-circle.css'
import VerbCircle from './verb-circle'

type ClauseProps = {
    verb: Phrase
}

const ClauseCircle: React.FC<ClauseProps> = ({ verb }) => {
    return (
        <div
            className="clause-circle"
        >
            <VerbCircle
                predicate={verb}
            />
        </div>
    )
}
export default ClauseCircle