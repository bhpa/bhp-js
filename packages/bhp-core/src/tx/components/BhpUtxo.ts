export interface BhpUtxoLike {
    prevHash: string;
    prevIndex: number;
    assetId: string;
    value: number;
    scriptHash: string;
}

export class BhpUtxo {
    public prevHash: string;
    public prevIndex: number;
    public assetId: string;
    public value: number;
    public scriptHash: string;

    public constructor(obj: BhpUtxoLike) {
        if (!obj || !obj.prevHash || !obj.prevIndex || !obj.assetId || !obj.value || !obj.scriptHash) {
            throw new Error("BhpUtxo requires prevHash, prevIndex, assetId, value, scriptHash");
        }
        this.prevHash = obj.prevHash;
        this.prevIndex = obj.prevIndex;
        this.assetId = obj.assetId;
        this.value = obj.value;
        this.scriptHash = obj.scriptHash;
    }
}