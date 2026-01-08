import type { Noun }
    from '../../../../grammar-structure/syntax/parts-of-speech/noun'
import { Coupling } from '../utils/coupling'
import './noun-circle.css'

type NounProps = {
    noun: Noun
    coupling: Coupling
    angle: number
    radius: number
}

const NounCirle: React.FC<NounProps> = ({ noun, coupling, angle, radius }) => {

    const rad: number = angle * Math.PI / 180
    const x: number = Math.cos(rad) * radius
    const y: number = Math.sin(rad) * radius

    const nounName: string = noun.getName()
    const circleSize: number = 1.2 * 16

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

            {coupling === Coupling.INPHASE && (
                <span
                    className='noun-name'
                    style={{
                        position: "absolute",
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px + ${circleSize / 2}px)`,
                        transform: "translateY(-50%)",
                    }}
                >
                    {nounName}
                </span>
            )}

            {coupling === Coupling.ANTIPHASE && (
                <span
                    className='noun-name'
                    style={{
                        position: "absolute",
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px - ${circleSize / 2}px)`,
                        transform: "translate(-100%, -50%)",
                    }}
                >
                    {nounName}
                </span>
            )}
        </div>
    )
}

export default NounCirle