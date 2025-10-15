import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import { posDictionary } from './utils/SyntaxConstants'

function App() {

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
        axios.post('http://127.0.0.1:8000/pos',
            {
                sentence: submitted
            }
        )
            .then(res => {
                let convertedList: string[] = []
                res.data.response.forEach((value: string) => {
                    convertedList.push(posDictionary[value])
                })

                setSentencePos(convertedList)
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
                        <p>
                            Here is the sentence you entered: {submitted}
                        </p>

                        {sentencePos.map((value, index) => (
                            <li
                                key={index}
                            >
                                {value}
                            </li>
                        ))}
                    </div>
                }
            </main>
        </div>
    )
}

export default App
