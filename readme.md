# 🎫 Stellar Soroban Ticketing DApp

This is my first full project where I built a **smart contract using Rust + Soroban**, integrated it with a **Next.js frontend**, and created a fully working decentralized application on the Stellar testnet.

The purpose of this project is to understand how to build, deploy, and interact with Soroban smart contracts — including contract storage, transaction handling, and Freighter wallet integration.

---

## 🚀 Project Description

This is a **simple ticketing decentralized application (DApp)** running on Stellar Soroban.

### Users can:
- **Buy a ticket**
- **Request a refund**
- **Redeem a ticket** after arriving at the venue

> Note:  
> There is **no separation** between admin and buyer dashboards.  
> Imagine this system as a single offline-managed flow handled entirely by an “admin.”  
> The goal is simplicity and demonstrating smart contract integration.

---

## 🛠 Tech Stack

### **Smart Contract**
- Rust  
- Soroban SDK  
- Soroban CLI  
- Persistent storage via `Env.storage().persistent()`

### **Frontend**
- Next.js  
- TypeScript  
- Freighter Wallet API  
- TailwindCSS  

---

# ⚙️ How to Run This Project

Below are the complete steps to run both the smart contract and the frontend, written in one continuous markdown file.

---

## 1️⃣ Install Required Tools

## Install Rust:
```bash
curl https://sh.rustup.rs -sSf | sh
```

## Install Soroban CLI:
```bash
cargo install soroban-cli
```

## Install Stellar CLI:
```bash
cargo install stellar-cli
```
## Add WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

## Documentation:
[Documentation Developer](https://developers.stellar.org/docs/build/smart-contracts/getting-started)

### 2️⃣ Install Dependencies

## Smart Contract
```bash
cd contract
cargo build
```

## Frontend
```bash
cd frontend
npm install
```

### 3️⃣ Build the Smart Contract
```bash
soroban contract build
```

## WASM file output:
```sql
target/wasm32-unknown-unknown/release/<contract_name>.wasm
```

### 4️⃣ Deploy to Stellar Testnet
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<contract_name>.wasm \
  --source-account <YOUR_TESTNET_WALLET> \
  --network testnet
```

**Save your Contract ID, the frontend needs it.**

### 5️⃣ Environment Setup

## Create .env.local inside the frontend folder:
```bash
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

## Notes:
- Every deploy creates a new contract ID
- Storage resets when redeployed

### 6️⃣ Run the Frontend Application
```bash
npm run dev
```

## Open your browser:
```bash
http://localhost:3000
```

## You can now:
- Connect Freighter wallet
- Buy tickets
- Request refunds
- Redeem tickets
- View purchased tickets
- View global statistics

### 🔍 Smart Contract Functionality
- buy_ticket(buyer, price) -> ticket_id
- Creates and stores a new ticket.
- request_refund(caller, ticket_id)
- Marks the ticket as refunded.
- redeem_ticket(caller, ticket_id) -> amount
- Redeems ticket at the place.
- get_ticket(ticket_id)

### 📝 Notes
- Made for learning & bootcamp submission
- Runs on Stellar Testnet only
- UI intentionally simple
- Requires Freighter Wallet
- Redeploying contract resets all stored data

### 🎉 Final Thoughts

## This is my first project fully integrating:
- Soroban smart contracts
- Rust blockchain logic
- Next.js frontend
- Wallet signing flow
- Testnet deployment

## It provides a clean introduction to full-stack blockchain development on Stellar.