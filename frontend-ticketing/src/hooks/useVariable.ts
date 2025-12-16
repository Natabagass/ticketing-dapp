import { useState, useEffect } from "react";

export const useVariable = () => {
    const [buyer, setBuyer] = useState("");
    const [price, setPrice] = useState("");
    const [ticketIdRedeem, setTicketIdRedeem] = useState("");
    const [ticketIdRefund, setTicketIdRefund] = useState("");
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState({ sales: 0, refunds: 0, redeem: 0 });
    const [tab, setTab] = useState<"buy" | "refund" | "redeem">("buy");
    const [message, setMessage] = useState("");

    return {
        buyer, setBuyer,
        price, setPrice,
        ticketIdRedeem, setTicketIdRedeem,
        ticketIdRefund, setTicketIdRefund,
        tickets, setTickets,
        stats, setStats,
        tab, setTab,
        message, setMessage
    };
};
