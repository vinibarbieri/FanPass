# FANPASS – Plataforma de Ingressos NFT com UX 100% Web2

**FANPASS** é uma plataforma Web3 desenvolvida na **Chiliz Chain**, onde clubes esportivos podem emitir ingressos como NFTs (ERC-721) e torcedores podem comprar, alugar ou transferir seus ingressos com **experiência totalmente Web2**, sem interação com carteiras.

---

## ✨ Visão Geral

- 🎟️ **Ingressos NFT** (ERC-721) para toda a temporada, emitidos diretamente pelos clubes
- 💳 **Compra via Pix ou Cartão** — sem necessidade de tokens ou carteiras
- 🔐 **Revenda limitada ao valor original**, conforme legislação brasileira
- 🔁 **Aluguel de ingressos** peer-to-peer, com royalties ao clube
- 💰 **Staking gamificado de Fan Tokens**: ganhe descontos em compras/aluguéis diretos com o clube
- 🏟️ **NFTs colecionáveis de momentos históricos**, distribuídos após presença no estádio
- 📲 **UX Web2 completa**: smart wallet invisível, login por e-mail, sem necessidade de MetaMask
- 📉 **Royalties automáticos** para o clube a cada transação no mercado secundário

---

## 🧱 Estrutura do Projeto

```

fanpass/
├── contracts/        # Smart contracts com Foundry (Solidity)
├── frontend/         # Aplicação React + TypeScript
├── backend/          # Node.js/Express para lógica e integrações
└── README.md

````

---

## ⚙️ Tecnologias Utilizadas

### Blockchain & Smart Contracts
- **Solidity 0.8.23** (EVM v19)
- **Chiliz Chain** (Mainnet: `88888`, Spicy Testnet: `88882`)
- **Foundry** para testes e deploy
- **ERC-721**, **ERC-2981**, **AccessControl**, **Royalties**, **Transfer restrictions**

### Frontend
- **React + TypeScript**
- **Tailwind CSS**
- Integração com backend via REST/GraphQL

### Backend
- **Node.js + Express**
- **Mongo** (login Web2)
- **Biconomy Smart Accounts** (Account Abstraction + gasless)

---

## 🛠️ Como Rodar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/vinibarbieri/fanpass.git
cd fanpass
````

### 2. Compile os contratos

```bash
cd contracts
forge install
forge build
```

### 3. Configure e inicie o backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 4. Rode o frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Rode o backend

```bash
cd backend
npm install
npm run dev
```

---

## 👤 Funcionalidades por Tipo de Usuário

### 🧍 Torcedor

* Cria conta com e-mail
* Visualiza ingressos para comprar ou alugar
* Ativa descontos ao reservar Fan Tokens (staking)
* Paga com Pix ou cartão (sem tokens!)
* Recebe NFTs colecionáveis por presença nos jogos

### 🏟️ Clube

* Emite ingressos para toda a temporada como NFTs
* Controla disponibilidade e permite parte para aluguel
* Recebe automaticamente os royalties de cada revenda ou aluguel
* Distribui recompensas por presença e ativa experiências

---

## 🗺️ Roadmap (em andamento)

* [x] Estrutura do projeto com Foundry
* [x] Deploy de `FanTicketNFT` com royalties
* [x] Integração com smart wallets e UX Web2
* [x] Implementar sistema de aluguel com tempo limitado
* [ ] Corrigir função de compra do `Marketplace.sol`
* [ ] Restrições legais para revenda acima do preço original
* [ ] Finalizar tela de benefícios com staking gamificado
* [ ] Subgraph para rastrear uso e presença
* [ ] Distribuição automática de NFTs colecionáveis

---

## 💬 Contato

Entre em contato pelo [LinkedIn](https://linkedin.com/in/vinibarbieri)

---

**FanPass** está construindo uma nova era na experiência de ir ao estádio — transparente, digital e feita para os torcedores de verdade.
