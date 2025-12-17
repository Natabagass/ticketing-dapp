// invoke for CUD, and read only for getting the data
import { contractInvoke, contractRead } from "./soroban";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";

// convert the address to smart contract value
const toAddr = (a: string) => new Address(a).toScVal();
const u32 = (n: number) => nativeToScVal(n, { type: "u32" });
const i128 = (n: number) => nativeToScVal(n, { type: "i128" });

// function buy ticket
export async function buyTicket(buyer: string, price: string) {
    // creating the args
    const args = [toAddr(buyer), i128(Number(price))];
    // invoke the contract include the params needed
    const id = await contractInvoke(buyer, "buy_ticket", args);
    return Number(id);
}

export async function requestRefund(caller: string, ticketId: number) {
    const args = [toAddr(caller), u32(ticketId)];
    return await contractInvoke(caller, "request_refund", args);
}

export async function redeemTicket(user: string, ticketId: number) {
    const args = [toAddr(user), u32(ticketId)];
    await contractInvoke(user, "redeem_ticket", args);
    return true;
}

export async function getTicket(ticketId: number) {
    // function to read the data from ledger
    const result = await contractRead("get_ticket", u32(ticketId));
    if (!result) return null;

    return {
        owner: String(result.owner),
        price: Number(result.price),
        refunded: Boolean(result.refunded),
        redeemed: Boolean(result.used)
    };
}

export async function getStats() {
    // function to read the data from ledger
    const res = await contractRead("get_stats");
    return {
        totalSales: Number(res[0]),
        totalRefunds: Number(res[1]),
        totalRedeem: Number(res[2])
    };
}
