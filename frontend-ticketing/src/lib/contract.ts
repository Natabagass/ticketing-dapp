import { contractInvoke, contractRead } from "./soroban";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";

const toAddr = (a: string) => new Address(a).toScVal();
const u32 = (n: number) => nativeToScVal(n, { type: "u32" });
const i128 = (n: number) => nativeToScVal(n, { type: "i128" });

export async function buyTicket(buyer: string, price: string) {
    const args = [toAddr(buyer), i128(Number(price))];
    const id = await contractInvoke(buyer, "buy_ticket", args);
    return Number(id);
}

export async function requestRefund(caller: string, ticketId: number) {
    const args = [toAddr(caller), u32(ticketId)];
    return await contractInvoke(caller, "request_refund", args);
}

export async function redeemRefund(caller: string, ticketId: number) {
    const args = [toAddr(caller), u32(ticketId)];
    const amount = await contractInvoke(caller, "redeem_refund", args);
    return Number(amount);
}

export async function getTicket(ticketId: number) {
    const res = await contractRead("get_ticket", u32(ticketId));
    if (!res) return null;
    return {
        owner: res.owner,
        price: Number(res.price),
        refunded: res.refunded,
    };
}

export async function getStats() {
    const res = await contractRead("get_stats");
    return {
        totalSales: Number(res[0]),
        totalRefunds: Number(res[1]),
    };
}
