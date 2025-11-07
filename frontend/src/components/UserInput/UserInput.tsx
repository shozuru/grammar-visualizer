import { useState, useEffect } from 'react'
import axios from 'axios'
import './UserInput.css'
import Circle from '../../Grammar Structure/visuals/Circle/Circle'
import { type SentenceInfo } from '../../Grammar Structure/types/SentenceInfo'
import { PartsOfSpeech } from '../../Grammar Structure/syntax/SyntaxConstants'
import { GrammarVisualizer }
    from '../../Grammar Structure/GrammarVisualizer'

const UserInput: React.FC = () => {

    const [inputSentence, setInputSentence] = useState<string>('')
    const [submitted, setSubmitted] = useState<string>('')
    const [sentencePos, setSentencePos] = useState<string[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputSentence(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (inputSentence.length > 0) {
            setSubmitted(inputSentence)
        }

        setInputSentence('')
    }

    useEffect(() => {
        axios.post('https://grammar-visualizer.duckdns.org/pos/',
            {
                sentence: submitted
                    .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()'"]/g, "")
            }
        )
            .then(res => {
                let posNumList: number[] = []
                let posNameList: string[] = []

                res.data.response.forEach((value: number) => {
                    posNumList.push(value)
                    posNameList.push(PartsOfSpeech[value])
                })

                setSentencePos(posNameList)

                let sentInfo: SentenceInfo = {
                    wordList: submitted.split(' '),
                    posList: posNumList
                }

                const sentenceStructure = new GrammarVisualizer(sentInfo)
            })

    }, [submitted])

    return (
        <div>
            <header>
                <h1>
                    Grammar Visualizer
                </h1>
            </header>
            <main>
                <p>
                    Enter a sentence to be analyzed
                </p>
                <form
                    onSubmit={handleSubmit}
                >
                    <input
                        type='text'
                        placeholder='This is a sample sentence'
                        value={inputSentence}
                        onChange={handleInputChange}
                    />
                    <input
                        type='submit'
                        value='Submit'
                    />
                </form>

                {submitted.length > 0 &&
                    <div>
                        <div
                            className='submitted-container'
                        >
                            <p
                                className='sentence-header'
                            >
                                The sentence you entered:
                            </p>
                            <p
                                className='submitted-sentence'
                            >
                                "{submitted}"
                            </p>

                        </div>

                        <Circle />

                        <ul>
                            {sentencePos.map((value, index) => (
                                <li
                                    key={index}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </main>
        </div>
    )
}

export default UserInput