import {
    rpc,
    Contract,
    TransactionBuilder,
    BASE_FEE,
    Account,
    scValToNative,
    Keypair,
} from "@stellar/stellar-sdk";

import { signTxWithFreighter } from "../lib/freighter";
import { RPC_URL, NETWORK_PASSPHRASE, CONTRACT_ID } from "./config";

const server = new rpc.Server(RPC_URL, { allowHttp: true });

export async function contractRead(fn: string, args?: any[] | any) {
    const contract = new Contract(CONTRACT_ID);

    const op =
        args == null
            ? contract.call(fn)
            : Array.isArray(args)
                ? contract.call(fn, ...args)
                : contract.call(fn, args);

    const dummy = Keypair.random();
    const dummyAcc = new Account(dummy.publicKey(), "0");

    let tx = new TransactionBuilder(dummyAcc, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(op)
        .setTimeout(30)
        .build();

    const sim = await server.simulateTransaction(tx);

    // Check error type response
    if ("error" in sim) {
        console.error("Simulation Error:", sim.error);
        throw new Error(sim.error);
    }

    // Ensure retval exists
    if (!sim.result || !sim.result.retval) {
        return null;
    }

    // Convert Soroban ScVal → JS value
    return scValToNative(sim.result.retval);
}

export async function contractInvoke(
    caller: string,
    fn: string,
    args?: any[] | any
) {
    const contract = new Contract(CONTRACT_ID);

    // Must be real wallet address
    const source = await server.getAccount(caller);

    const op =
        args == null
            ? contract.call(fn)
            : Array.isArray(args)
                ? contract.call(fn, ...args)
                : contract.call(fn, args);

    let tx = new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(op)
        .setTimeout(30)
        .build();

    // Prepare TX
    tx = await server.prepareTransaction(tx);

    // Sign with Freighter
    const signedTx = await signTxWithFreighter(
        tx.toXDR(),
        NETWORK_PASSPHRASE,
        caller
    );

    // Submit
    const sendRes = await server.sendTransaction(signedTx);

    // Poll for result
    let txRes = await server.getTransaction(sendRes.hash);

    while (txRes.status === "NOT_FOUND") {
        await new Promise((r) => setTimeout(r, 250));
        txRes = await server.getTransaction(sendRes.hash);
    }

    if (txRes.status !== "SUCCESS") {
        console.error("TX FAILED:", txRes);
        throw new Error("Transaction failed.");
    }

    return txRes.returnValue ? scValToNative(txRes.returnValue) : null;
}
