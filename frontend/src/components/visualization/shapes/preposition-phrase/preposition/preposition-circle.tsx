import type { Preposition }
    from '../../../../../grammar-structure/syntax/parts-of-speech/preposition'
import './preposition-circle.css'


type PrepositionProps = {
    prep: Preposition
    angle: number
    radius: number
}

const PrepositionCircle: React.FC<PrepositionProps> =
    ({ prep, angle, radius }) => {
        const rad: number = angle * Math.PI / 180
        const x: number = Math.cos(rad) * radius
        const y: number = Math.sin(rad) * radius

        const prepName: string = prep.getName()
        const circleSize: number = 1.2 * 16

        return (
            <div
                className='preposition-container'
            >
                <div
                    className='preposition-circle'
                    style={{
                        position: "absolute",
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        transform: "translate(-50%, -50%)",
                    }}
                />

                <span
                    className='preposition-name'
                    style={{
                        position: "absolute",
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px + ${circleSize / 2}px)`,
                        transform: "translateY(-50%)",
                    }}
                >
                    {prepName}
                </span>
            </div>
        )
    }
export default PrepositionCircle