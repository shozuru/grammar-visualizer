import type { Adverb }
    from '../../../../grammar-structure/syntax/parts-of-speech/adverb'
import './adverb-circle.css'

type AdverbProps = {
    adverb: Adverb
    angle: number
    radius: number
}

const AdverbCircle: React.FC<AdverbProps> = ({ adverb, angle, radius }) => {
    const rad = angle * Math.PI / 180
    const x = Math.cos(rad) * radius
    const y = Math.sin(rad) * radius

    const adverbName = adverb.getName()
    const circleSize = 1.2 * 16

    return (
        <div
            className='adverb-container'
        >
            <span
                className='adverb-circle'
                style={{
                    position: "absolute",
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                    transform: "translate(-50%, -50%)",
                }}
            />

            <span
                className='adverb-name'
                style={{
                    position: "absolute",
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px + ${circleSize / 2}px)`,
                    transform: "translateY(-50%)",
                }}
            >
                {adverbName}
            </span>
        </div>
    )
}
export default AdverbCircle