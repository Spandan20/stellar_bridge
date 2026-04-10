import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CANY2ITMUMXKIFESERJMMBCBLUBUDZMPSM2ZZ3BADFNXFGW6GIUM5JGT",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAKZ2V0X2xvY2tlZAAAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD7QAAAAMAAAALAAAAEQAAA+4AAAAg",
            "AAAAAAAAAAAAAAAKbG9ja19mdW5kcwAAAAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAMdGFyZ2V0X2NoYWluAAAAEQAAAAAAAAAOdGFyZ2V0X2FkZHJlc3MAAAAAA+4AAAAgAAAAAA==",
            "AAAAAAAAAAAAAAANcmVsZWFzZV9mdW5kcwAAAAAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACnByb29mX2hhc2gAAAAAA+4AAAAgAAAAAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        get_locked: (this.txFromJSON),
        lock_funds: (this.txFromJSON),
        release_funds: (this.txFromJSON)
    };
}
