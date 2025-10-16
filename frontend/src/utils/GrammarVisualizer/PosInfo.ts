export class PosInfo {

    private posList: number[]

    constructor(listOfPos: number[]) {
        this.posList = listOfPos
    }

    public getPOSList(): number[] {
        return this.posList
    }

    public setPOSList(posList: number[]): void {
        this.posList = posList
    }
}