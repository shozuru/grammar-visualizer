import { isNoun, isNounModifier } from "../partOfSpeechUtils/partOfSpeechUtils"
import { Noun } from "./Noun"
import type { Pair } from "../types/Pair"

export abstract class CanTakeObject {

    protected object: Noun | null = null

    public tagIfObject(listOfNextWords: Pair[]): void {
        // list for elements that modify nouns (determiners, quantifiers, etc)
        let nounModiferList: string[] = []
        if (listOfNextWords.length > 0) {
            let i: number = 0
            let nextPair: Pair = listOfNextWords[i]
            while (nextPair && !isNoun(nextPair)) {
                if (isNounModifier(nextPair)) {
                    // shift off the element 
                    let nounModifierPair: Pair = listOfNextWords.shift() as Pair
                    // add element to the noun modifier list
                    nounModiferList.push(nounModifierPair.name)
                    nextPair = listOfNextWords[i]
                } else {
                    nextPair = listOfNextWords[i + 1]
                }
            }
            if (nextPair !== undefined) {
                // element has noun object
                let nounObject: Noun = new Noun(nextPair.name)
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