"use client";

import { useFunction } from "@/hooks/useFunction";
import { useVariable } from "@/hooks/useVariable";

export default function TicketDashboard() {
  const state = useVariable();
  const fn = useFunction(state);

  const {
    buyer,
    tickets,
    stats,
    message,
    setTab,
    tab,
    price,
    setPrice,
    ticketIdRefund,
    ticketIdRedeem,
    setTicketIdRedeem,
    setTicketIdRefund
  } = state;

  const {
    handleBuy,
    handleRefund,
    handleRedeem,
    connectWallet
  } = fn;

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
              value={ticketIdRefund}
              onChange={(e) => setTicketIdRefund(e.target.value)}
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
            <h2 className="font-semibold text-xl mb-2">Redeem Ticket</h2>
            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Ticket ID"
              value={ticketIdRedeem}
              onChange={(e) => setTicketIdRedeem(e.target.value)}
            />
            <button
              className="bg-green-600 text-white p-2 rounded w-full"
              onClick={handleRedeem}
            >
              Redeem
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
                <p>Status: {t.refunded ? "Refunded" : t.redeemed ? "Redeemed" : "Active"}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold mt-8 mb-1">📊 Stats</h3>
        <p>Total Sales: {stats.sales}</p>
        <p>Total Refunds: {stats.refunds}</p>
        <p>Total Redeem: {stats.redeem}</p>
      </div>
    </main>
  );
}
