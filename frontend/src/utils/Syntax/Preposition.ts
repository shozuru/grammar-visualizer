import type { Noun } from "./Noun";

export class Preposition {

    private object: Noun | null

    constructor() {
        this.object = null
    }

    public hasObject(): boolean {
        return this.object !== null
    }

    public getObject(): Noun | null {
        return this.object
    }

    public setObject(noun: Noun): void {
        this.object = noun
    }
}