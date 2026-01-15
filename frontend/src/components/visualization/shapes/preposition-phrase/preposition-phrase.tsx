import type { Noun }
    from '../../../../grammar-structure/syntax/parts-of-speech/noun'
import type { Preposition }
    from '../../../../grammar-structure/syntax/parts-of-speech/preposition'
import { Coupling } from '../utils/coupling'
import NounCirle from '../noun/noun-circle'
import './preposition-phrase.css'
import PrepositionCircle from './preposition/preposition-circle'

type PrepPhraseProps = {
    preposition: Preposition
    index: number
}

const PrepositionPhrase: React.FC<PrepPhraseProps> =
    ({ preposition, index }) => {

        const object: Noun | undefined = preposition.getObject()
        const radius: number = 32

        return (
            <div
                className='preposition-phrase'
            >
                <PrepositionCircle
                    prep={preposition}
                    angle={0}
                    radius={radius}
                    key={`prepPhrase-prep-${index}`}
                />

                {object &&
                    <NounCirle
                        noun={object}
                        coupling={Coupling.ANTIPHASE}
                        angle={180}
                        radius={radius}
                        key={`prepPhrase-noun-${index}`}
                    />
                }
            </div>
        )
    }
export default PrepositionPhrase