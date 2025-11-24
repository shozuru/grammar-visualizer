// import { WordBuilder } from "./WordBuilder";
// import { Verb } from "../syntax/partsOfSpeech/Verb";
// import type { Word } from "../types/Word";

// export class VerbBuilder extends WordBuilder {

//     private verb: Verb | null

//     constructor() {
//         super()
//         this.verb = null
//     }

//     public createAndSetVerb(word: Word): void {
//         const verb: Verb = new Verb(word.name)
//         this.verb = verb
//     }

//     public getVerb(): Verb | null {
//         return this.verb
//     }

//     public build(): Verb {
//         if (!(this.verb instanceof Verb)) {
//             throw Error("Tried to build verb without head")
//         }
//         for (const agr of super.getAgrStack()) {
//         }
//     }
// }