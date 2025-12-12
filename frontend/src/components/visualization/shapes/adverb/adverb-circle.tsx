import type { Adverb }
    from '../../../../grammar-structure/syntax/parts-of-speech/adverb'
import './adverb-circle.css'

type AdverbProps = {
    adverb: Adverb
}

const AdverbCircle: React.FC<AdverbProps> = ({ adverb }) => {
    return (
        <div
            className='adverb-container'
        >
            <span
                className='adverb-circle'
            />

            <span
                className='adverb-name'
            >
                {adverb.getName()}
            </span>
        </div>
    )
}
export default AdverbCircle