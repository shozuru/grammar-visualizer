import type { ClauseBuilder } from "../../builders/clause-builder";
import type { Word } from "../../types/word";
import type { WordHandler } from "./word-handler";

export class ConjunctionHandler implements WordHandler {
    public handle(conjunction: Word, builder: ClauseBuilder): void {
        throw Error("I made it this far")
    }
}