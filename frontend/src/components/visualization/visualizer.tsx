import Circle from './shapes/circle/Circle.tsx'
import { Clause } from '../../grammar-structure/syntax/parts-of-speech/clause'
import './visualizer.css'

type VisualProps = {
    clauseList: Clause[]
}

const Visualizer: React.FC<VisualProps> = ({ clauseList }) => {
    const clauseNumber: number = clauseList.length

    return (
        <div>
            {Array.from({ length: clauseList.length }).map((_, i) => (
                <Circle
                    key={i}
                />
            ))}
        </div>
    )
}

export default Visualizer