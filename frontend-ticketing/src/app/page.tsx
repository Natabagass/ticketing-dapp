"use client";

import { useState, useEffect } from "react";
import {
  buyTicket,
  requestRefund,
  redeemRefund,
  getTicket,
  getStats,
} from "@/lib/contract";

import { requestAccess, isConnected } from "@stellar/freighter-api";

function isValidStellarAddress(addr: string) {
  return typeof addr === "string" && addr.startsWith("G") && addr.length === 56;
}

export default function TicketDashboard() {
  const [buyer, setBuyer] = useState("");
  const [price, setPrice] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, refunds: 0 });
  const [tab, setTab] = useState<"buy" | "refund" | "redeem">("buy");
  const [message, setMessage] = useState("");

  async function connectWallet() {
    const ok = await isConnected();
    if (!ok) {
      setMessage("❌ Freighter not installed or inactive");
      return;
    }
  
    const access = await requestAccess();
  
    if (access.error) {
      setMessage("❌ User denied access: " + access.error);
      return;
    }
  
    if (!access.address) {
      setMessage("❌ No address returned. Try refreshing the page.");
      return;
    }
  
    setBuyer(access.address);
    setMessage(`Connected: ${access.address}`);
  }


  async function refreshStats() {
    try {
      const res = await getStats();
      setStats({
        sales: res.totalSales,
        refunds: res.totalRefunds,
      });
    } catch {
      setMessage("Failed to fetch stats");
    }
  }

  async function refreshTickets() {
    if (!isValidStellarAddress(buyer)) return;

    const arr: any[] = [];

    for (let id = 0; id < stats.sales; id++) {
      try {
        const t = await getTicket(id);
        if (t?.owner === buyer) arr.push({ id, ...t });
      } catch {
        // ignore errors for non-existing tickets
      }
    }

    setTickets(arr);
  }

  async function handleBuy() {
    if (!isValidStellarAddress(buyer))
      return setMessage("Invalid wallet address.");

    try {
      const id = await buyTicket(buyer, price);
      setMessage(`🎉 Bought ticket ID: ${id}`);

      await refreshStats();
      await refreshTickets();
    } catch (err: any) {
      setMessage(err.message || "Buy failed.");
    }
  }

  async function handleRefund() {
    if (!isValidStellarAddress(buyer))
      return setMessage("Invalid wallet address.");

    if (!ticketId) return setMessage("Please enter Ticket ID");

    try {
      await requestRefund(buyer, Number(ticketId));
      setMessage("Refund requested ✔");

      await refreshTickets();
    } catch (err: any) {
      setMessage(err.message || "Refund failed.");
    }
  }

  async function handleRedeem() {
    if (!isValidStellarAddress(buyer))
      return setMessage("Invalid wallet address.");

    if (!ticketId) return setMessage("Please enter Ticket ID");

    try {
      const amount = await redeemRefund(buyer, Number(ticketId));
      setMessage(`💰 Refund redeemed: ${amount}`);

      await refreshTickets();
    } catch (err: any) {
      setMessage(err.message || "Redeem failed.");
    }
  }

  useEffect(() => {
    if (isValidStellarAddress(buyer)) {
      refreshStats();
      refreshTickets();
    }
  }, [buyer]);

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 min-h-screen bg-gray-50">

      <div className="space-y-6 bg-white shadow p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-6">🎫 Ticket Dashboard</h1>

        <button
          className="bg-black text-white p-2 rounded w-full"
          onClick={connectWallet}
        >
          Connect Freighter Wallet
        </button>

        {buyer && (
          <p className="text-gray-700 text-sm break-all">
            Connected: <span className="font-mono">{buyer}</span>
          </p>
        )}

        <div className="flex gap-3">
          {["buy", "refund", "redeem"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === "buy" && (
          <div>
            <h2 className="font-semibold text-xl mb-2">Buy Ticket</h2>
            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white p-2 rounded w-full"
              onClick={handleBuy}
            >
              Buy Ticket
            </button>
          </div>
        )}

        {tab === "refund" && (
          <div>
            <h2 className="font-semibold text-xl mb-2">Request Refund</h2>
            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
            <button
              className="bg-yellow-500 text-white p-2 rounded w-full"
              onClick={handleRefund}
            >
              Refund Ticket
            </button>
          </div>
        )}

        {tab === "redeem" && (
          <div>
            <h2 className="font-semibold text-xl mb-2">Redeem Refund</h2>
            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
            />
            <button
              className="bg-green-600 text-white p-2 rounded w-full"
              onClick={handleRedeem}
            >
              Redeem Refund
            </button>
          </div>
        )}

        {message && (
          <p className="p-2 text-center text-gray-700">{message}</p>
        )}
      </div>

      <div className="bg-white shadow p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">🎟 Your Tickets</h2>

        {tickets.length === 0 && (
          <p className="text-gray-500">You have no tickets yet.</p>
        )}

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">Ticket ID: {t.id}</p>
                <p>Price: {t.price}</p>
                <p>Status: {t.refunded ? "Refunded" : "Active"}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold mt-8 mb-1">📊 Stats</h3>
        <p>Total Sales: {stats.sales}</p>
        <p>Total Refunds: {stats.refunds}</p>
      </div>
    </main>
  );
}
