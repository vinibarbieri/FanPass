# FANPASS – Plataforma de Ingressos NFT com UX 100% Web2

**FANPASS** é uma plataforma Web3 desenvolvida na **Chiliz Chain**, onde clubes esportivos podem emitir ingressos como NFTs (ERC-721) e torcedores podem comprar, alugar ou transferir esses ingressos utilizando **Fan Tokens (ERC20)**. Tudo isso com uma experiência **completamente Web2**, sem necessidade de conexão com carteira ou conhecimento em blockchain por parte do usuário.

---

## ✨ Visão Geral

- **Ingressos como NFTs** (ERC-721) emitidos pelos clubes
- **Compra via Pix ou Cartão**, convertida automaticamente em Fan Tokens (CHZ)
- **Royalties on-chain** para os clubes a cada transação
- **NFTs colecionáveis** automáticos após presença no jogo
- **Painel do torcedor** com histórico, NFTs e experiências desbloqueadas
- **Smart wallets invisíveis**, criadas automaticamente com Account Abstraction
- **Sem conexão com MetaMask ou carteiras Web3** → experiência 100% Web2

---

## 🧱 Estrutura do Projeto

```
fanpass/
├── contracts/        # Smart contracts com Foundry (Solidity)
├── frontend/         # Aplicação React + TypeScript
├── backend/          # Node.js/Express para lógica e integrações
├── sdk/              # Client SDK para interagir com os contratos
├── subgraphs/        # Configurações do The Graph
├── infra/            # Docker, CI/CD, scripts de deploy
├── test/             # Testes com Foundry
└── README.md
```

---

## ⚙️ Tecnologias Utilizadas

### Blockchain & Smart Contracts
- **Solidity 0.8.23** (EVM v19)
- **Chiliz Chain** (Mainnet: `88888`, Testnet: `88882`)
- **Foundry** (`forge`, `cast`) para desenvolvimento e testes
- **ERC-721**, **ERC-2981**, **CREATE2**, **Pausable**, **AccessControl**

### Frontend
- **React + TypeScript**
- **Tailwind CSS ou Bootstrap**
- **Framer Motion** (animações)
- UX Web2: sem carteiras, tudo automatizado

### Backend
- **Node.js + Express**
- **Firebase Auth/Auth0** (login com email/social)
- **Biconomy Smart Accounts** (account abstraction + gasless)
- **Tatum ou Moralis** (conversão Pix/cartão → Fan Token)

### Integrações
- **Pyth** (preço em USD dos Fan Tokens + randomness)
- **The Graph** (subgraph de presença e transferências)
- **Envio** (monitoramento e alertas no Telegram)
- **Blocknative Gas API** (estimativa de taxas)

---

## 🚀 Como Rodar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/fanpass.git
cd fanpass
```

### 2. Setup dos contratos com Foundry
```bash
cd contracts
forge install
forge build
forge test
```

### 3. Executar o backend
```bash
cd backend
npm install
cp .env.example .env   # configure variáveis de ambiente
npm run dev
```

### 4. Executar o frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Funcionalidades por Papel

### Torcedor
- Cria conta com email/social login
- Vê saldo em Fan Tokens na dashboard
- Compra ingressos com Pix ou cartão
- Recebe NFTs automaticamente após ir ao jogo

### Clube
- Acessa painel para mint de ingressos
- Define datas, locais e recompensas por presença
- Recebe royalties on-chain por cada revenda

---

## 📌 Roadmap (em andamento)

- [x] Estrutura do projeto
- [x] Deploy inicial de `FanTicketNFT`
- [ ] Integração com login social
- [ ] Geração automática de wallet (Biconomy)
- [ ] Conversão Pix/cartão → CHZ (via Tatum)
- [ ] Integração com Pyth e The Graph
- [ ] Deploy final na Chiliz Mainnet
