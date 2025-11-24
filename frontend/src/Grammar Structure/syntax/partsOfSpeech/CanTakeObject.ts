import { isNoun, isNounModifier } from "../SyntaxMethods"
import { Noun } from "./Noun"
import type { Word } from "../../types/Word"
import { Mod } from "../Mod"

export abstract class CanTakeObject {

    protected object: Noun | null = null

    public tagIfObject(listOfNextWords: Word[]): void {
        const nounModiferList: Mod[] = []
        const i: number = 0
        if (listOfNextWords[i]) {
            const nextWord: Word = listOfNextWords[i]
            while (nextWord && !isNoun(nextWord)) {
                if (isNounModifier(nextWord, listOfNextWords)) {
                    // shift off the element and add to mod list
                    const modWord: Word =
                        listOfNextWords.shift() as Word
                    const mod: Mod = new Mod(modWord)
                    nounModiferList.push(mod)
                    nextWord = listOfNextWords[i]
                } else {
                    nextWord = listOfNextWords[i + 1]
                }
            }
            if (nextWord !== undefined) {
                // element has noun object
                const [nounWord]: Word[] = listOfNextWords.splice(i, 1)
                const nounObject: Noun = new Noun(nounWord.name)
                if (nounModiferList.length > 0) {
                    // add modifiers to noun
                    for (const modifier of nounModiferList) {
                        nounObject.addModifier(modifier)
                    }
                }
                this.object = nounObject
            }
        }
    }
}