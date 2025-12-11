import type { Noun } from '../../../grammar-structure/syntax/parts-of-speech/noun'
import './noun-circle.css'

type NounProps = {
    noun: Noun
}

const NounCirle: React.FC<NounProps> = ({ noun }) => {
    return (
        <>
            <span
                className="noun-circle"
            />
            <span
                className='name'
            >
                {noun.getName()}
            </span>
        </>
    )
}

export default NounCirle