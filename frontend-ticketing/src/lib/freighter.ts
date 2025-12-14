import {
    isConnected,
    getAddress,
    signTransaction,
} from "@stellar/freighter-api";


import { TransactionBuilder } from "@stellar/stellar-sdk";

export async function getWalletAddress() {
    if (!(await isConnected())) throw new Error("Freighter not installed");

    const pubKey = await getAddress();
    return pubKey;
}

export async function signTxWithFreighter(
    txXDR: string,
    networkPassphrase: string,
    address: string
) {
    const signed = await signTransaction(txXDR, {
        networkPassphrase,
        address,
    });

    if (!signed.signedTxXdr) {
        console.error("Freighter returned error:", signed);
        throw new Error("Freighter did not sign transaction");
    }

    const envelopeXdr = signed.signedTxXdr;

    const tx = TransactionBuilder.fromXDR(envelopeXdr, networkPassphrase);

    return tx;
}
