import type { Noun } from '../../../grammar-structure/syntax/parts-of-speech/noun'
import './noun-circle.css'

type NounProps = {
    noun: Noun
    index: number
    total: number
    radius: number
}

const NounCirle: React.FC<NounProps> = ({ noun, index, total, radius }) => {
    const arcSpan: number = 90
    const half: number = arcSpan / 2

    const angleDeg: number = -half + (index / (total - 1 || 1)) * arcSpan
    const rad: number = (angleDeg * Math.PI) / 180

    const x: number = Math.cos(rad) * radius
    const y: number = Math.sin(rad) * radius


    const nounName: string = noun.getName()
    const circleSize: number = 1.2 * 16
    const margin: number = 8

    return (
        <div
            className='noun-container'
        >
            <span
                className="noun-circle"
                style={{
                    position: "absolute",
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                    transform: "translate(-50%, -50%)",
                }}
            />

            <span
                className='noun-name'
                style={{
                    position: "absolute",
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px + ${circleSize / 2 + margin}px)`,
                    transform: "translateY(-50%)",
                }}
            >
                {nounName}
            </span>
        </div>
    )
}

export default NounCirle