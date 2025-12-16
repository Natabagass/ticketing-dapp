import { buyTicket, getStats, getTicket, redeemTicket, requestRefund } from "@/lib/contract";
import { isConnected, requestAccess } from "@stellar/freighter-api";

export const useFunction = (state: any) => {
    const {
        buyer, setBuyer,
        setTickets,
        stats, setStats,
        price, setPrice,
        ticketIdRefund, setTicketIdRefund,
        ticketIdRedeem, setTicketIdRedeem,
        setMessage
    } = state;

    const isValid = (a: string) => a.startsWith("G") && a.length === 56;

    async function connectWallet() {
        const ok = await isConnected();
        if (!ok) return setMessage("Freighter not active");

        const res = await requestAccess();
        if (res.error) return setMessage(res.error);

        setBuyer(res.address);
    }

    async function refreshStats() {
        const res = await getStats();
        setStats({
            sales: res.totalSales,
            refunds: res.totalRefunds,
            redeem: res.totalRedeem
        });
    }

    async function refreshTickets() {
        if (!isValid(buyer)) return;

        const arr: any[] = [];
        for (let id = 0; id <= stats.sales; id++) {
            try {
                const t = await getTicket(id);
                if (t && String(t.owner) === buyer) arr.push({ id, ...t });
            } catch {}
        }
        setTickets(arr);
    }

    async function handleBuy() {
        const id = await buyTicket(buyer, price);
        setMessage(`Bought ID ${id}`);
        setPrice("");

        await refreshStats();
        await refreshTickets();
    }

    async function handleRefund() {
        await requestRefund(buyer, Number(ticketIdRefund));
        setTicketIdRefund("");
        await refreshTickets();
    }

    async function handleRedeem() {
        await redeemTicket(buyer, Number(ticketIdRedeem));
        setTicketIdRedeem("");
        await refreshTickets();
    }

    return {
        connectWallet,
        refreshStats,
        refreshTickets,
        handleBuy,
        handleRefund,
        handleRedeem
    };
};
