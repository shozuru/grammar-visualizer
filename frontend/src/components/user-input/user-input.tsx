import { useState } from 'react'
import axios from 'axios'
import './user-input.css'
import Visualizer from '../visualization/visualizer'
import { type SentenceInfo } from '../../grammar-structure/types/sentence-info'
import { PartsOfSpeech } from '../../grammar-structure/syntax/syntax-constants'
import { GrammarVisualizer }
    from '../../grammar-structure/grammar-visualizer'
import { Clause }
    from '../../grammar-structure/syntax/parts-of-speech/clause'

const UserInput: React.FC = () => {

    const [inputSentence, setInputSentence] = useState<string>('')
    const [submitted, setSubmitted] = useState<string>('')
    const [clauses, setClauses] = useState<Clause[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputSentence(e.target.value)
    }

    const submitSentence = (input: string) => {
        axios.post('https://grammar-visualizer.duckdns.org/pos/',
            {
                sentence: input
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

                // setSentencePos(posNameList)

                const sentInfo: SentenceInfo = {
                    wordList: inputSentence.split(' '),
                    posList: posNumList
                }

                const structure: GrammarVisualizer =
                    new GrammarVisualizer(sentInfo)

                const clauses = structure.getClauses()
                setClauses(clauses)
            })
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (inputSentence.length > 0) {
            setSubmitted(inputSentence)
            submitSentence(inputSentence)
            setInputSentence('')
        }
    }

    return (
        <div>
            <header>
                <h1>
                    Grammar Visualizer
                </h1>
            </header>
            <main>
                <div
                    className='input-container'
                >
                    <p>
                        Enter a sentence to be analyzed
                    </p>
                    <form
                        onSubmit={handleSubmit}
                    >
                        <input
                            type='text'
                            // placeholder='This is a sample sentence'
                            value={inputSentence}
                            onChange={handleInputChange}
                        />
                        <input
                            className="submit-button"
                            type='submit'
                            value='Submit'
                        />
                    </form>
                </div>

                {submitted.length > 0 &&
                    clauses.length > 0 &&

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

                        <div
                            className='representation-heading'
                        >
                            Sentence representation:
                        </div>

                        <div
                            className='visualizer-container'
                        >
                            <Visualizer
                                clauseList={clauses}
                            />
                        </div>
                    </div>
                }
            </main>
        </div>
    )
}

export default UserInput