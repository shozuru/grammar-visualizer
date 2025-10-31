

// if (relSubject !== null) {
//     if (
//         relSubject
//             .getModifiers()
//             .some(
//                 mod =>
//                     mod.getPos() === PartsOfSpeech.CAUSATIVE
//             )
//     ) {
//         relClause.setCausativeNoun(relSubject)
//     } else {
//         relClause.addNounToClause(relSubject)
//     }
// }
// if (relSystemNoun
//     .getModifiers()
//     .some(
//         mod =>
//             mod.getPos() === PartsOfSpeech.CAUSATIVE
//     )
// ) {
//     relClause.setCausativeNoun(relSystemNoun)
// } else {
//     relClause.addNounToClause(relSystemNoun)
// }


//  public addClauseArgumentsAndAdjuncts(
//     relClause: Clause,
//     listOfWords: Word[]
// ): void {

//     while(listOfWords[0] && !isVerbalElement(listOfWords[0])) {
//             else if (
//         isPassive(currentWord)
//     ) {
//         nounModStack.push(new Mod(currentWord))
//     }

//     if (isPreposition(currentWord)) {
//         let pPhrase: Preposition = new Preposition(currentWord.name)
//         addPhraseToClause(pPhrase, relClause)
//     }
//     if (nounModStack.length > 0 &&
//         nounModStack[0].getName() === "by"
//     ) {
//         relClause
//             .getNouns()
//             .forEach(noun => {
//                 if (noun.getName() === "that") {
//                     let passiveMod: Mod = nounModStack.shift() as Mod
//                     noun.addModifier(passiveMod)
//                 }
//             })
//     }
// }
//     }