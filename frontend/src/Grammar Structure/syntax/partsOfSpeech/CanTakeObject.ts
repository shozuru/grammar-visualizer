import { isNoun, isNounModifier } from "../SyntaxMethods"
import { Noun } from "./Noun"
import type { Word } from "../../types/Word"
import { Mod } from "../Mod"

export abstract class CanTakeObject {

    protected object: Noun | null = null

    public tagIfObject(listOfNextWords: Word[]): void {
        let nounModiferList: Mod[] = []
        let i: number = 0
        if (listOfNextWords[i]) {
            let nextWord: Word = listOfNextWords[i]
            while (nextWord && !isNoun(nextWord)) {
                if (isNounModifier(nextWord, listOfNextWords)) {
                    // shift off the element and add to mod list
                    let modWord: Word =
                        listOfNextWords.shift() as Word
                    let mod: Mod = new Mod(modWord)
                    nounModiferList.push(mod)
                    nextWord = listOfNextWords[i]
                } else {
                    nextWord = listOfNextWords[i + 1]
                }
            }
            if (nextWord !== undefined) {
                // element has noun object
                let [nounWord]: Word[] = listOfNextWords.splice(i, 1)
                let nounObject: Noun = new Noun(nounWord.name)
                if (nounModiferList.length > 0) {
                    // add modifiers to noun
                    for (let modifier of nounModiferList) {
                        nounObject.addModifier(modifier)
                    }
                }
                this.object = nounObject
            }
        }
    }
}