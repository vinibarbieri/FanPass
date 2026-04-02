# FANPASS – NFT Ticketing Platform with 100% Web2 UX

**FANPASS** is a Web3 platform built on **Chiliz Chain**, where sports clubs can issue tickets as NFTs (ERC-721) and fans can buy, rent, or transfer tickets with a **fully Web2 experience**, with no wallet interaction.

---

## ✨ Overview

- 🎟️ **NFT tickets** (ERC-721) for the full season, issued directly by clubs
- 💳 **Purchase via Pix or card** — no tokens or wallets required
- 🔐 **Resale capped at the original price**, aligned with Brazilian regulation
- 🔁 **Peer-to-peer ticket rentals**, with royalties to the club
- 💰 **Gamified Fan Token staking**: earn discounts on direct purchases/rentals with the club
- 🏟️ **Collectible NFTs for historic moments**, distributed after stadium attendance
- 📲 **Full Web2 UX**: invisible smart wallet, email login, no MetaMask required
- 📉 **Automatic royalties** for the club on every secondary-market transaction

---

## 🧱 Project Structure

```

fanpass/
├── contracts/        # Smart contracts with Foundry (Solidity)
├── frontend/         # React + TypeScript app
├── backend/          # Node.js/Express for logic and integrations
└── README.md

````

---

## ⚙️ Tech Stack

### Blockchain & smart contracts
- **Solidity 0.8.23** (EVM v19)
- **Chiliz Chain** (Mainnet: `88888`, Spicy Testnet: `88882`)
- **Foundry** for testing and deployment
- **ERC-721**, **ERC-2981**, **AccessControl**, **Royalties**, **Transfer restrictions**

### Frontend
- **React + TypeScript**
- **Tailwind CSS**
- Backend integration via REST/GraphQL

### Backend
- **Node.js + Express**
- **Mongo** (Web2 login)
- **Biconomy Smart Accounts** (Account Abstraction + gasless)

---

## 🛠️ Running the Project

### 1. Clone the repository
```bash
git clone https://github.com/vinibarbieri/fanpass.git
cd fanpass
````

### 2. Compile the contracts

```bash
cd contracts
forge install
forge build
```

### 3. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 👤 Features by User Type

### 🧍 Fan

* Sign up with email
* Browse tickets to buy or rent
* Unlock discounts by reserving Fan Tokens (staking)
* Pay with Pix or card (no tokens!)
* Receive collectible NFTs for attending matches

### 🏟️ Club

* Issue full-season tickets as NFTs
* Control availability and allow a portion for rental
* Automatically receive royalties on every resale or rental
* Distribute attendance rewards and activate experiences

---

## 🗺️ Roadmap (in progress)

* [x] Project structure with Foundry
* [x] Deploy `FanTicketNFT` with royalties
* [x] Smart wallet integration and Web2 UX
* [x] Time-limited rental system
* [ ] Fix purchase flow in `Marketplace.sol`
* [ ] Legal restrictions for resale above original price
* [ ] Finish benefits screen with gamified staking
* [ ] Subgraph to track usage and attendance
* [ ] Automatic distribution of collectible NFTs

---

## 💬 Contact

Reach out on [LinkedIn](https://linkedin.com/in/vinibarbieri)

---

**FanPass** is building a new era in the stadium experience — transparent, digital, and built for real fans.
