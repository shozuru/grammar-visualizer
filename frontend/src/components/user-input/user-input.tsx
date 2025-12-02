import { useState, useEffect } from 'react'
import axios from 'axios'
import './user-input.css'
import Circle from '../../grammar-structure/visuals/circle/Circle'
import { type SentenceInfo } from '../../grammar-structure/types/sentence-info'
import { PartsOfSpeech } from '../../grammar-structure/syntax/syntax-constants'
import { GrammarVisualizer }
    from '../../grammar-structure/grammar-visualizer'
import type { Clause } from '../../grammar-structure/syntax/parts-of-speech/clause'

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
                const posNumList: number[] = []
                const posNameList: string[] = []

                res.data.response.forEach((value: number) => {
                    posNumList.push(value)
                    posNameList.push(PartsOfSpeech[value])
                })

                setSentencePos(posNameList)

                const sentInfo: SentenceInfo = {
                    wordList: submitted.split(' '),
                    posList: posNumList
                }

                const structure = new GrammarVisualizer(sentInfo)
                const clauses: Clause[] = structure.getClauses()
                console.log(clauses)
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