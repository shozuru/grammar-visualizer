export enum PartsOfSpeech {
    NOUN = "Noun",
    VERB = "Verb",
    ADVERB = "Adverb",
    CONJUNCTION = "Conjunction",
    DETERMINER = "Determiner",
    UNKNOWN = "Unknown"
}

export let determinerSet: Set<string> = new Set<string>(
    [
        "the",
        "a",
        "some"
    ]
) 