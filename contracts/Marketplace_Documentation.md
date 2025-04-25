# 📄 Marketplace Smart Contract - Guia de Uso

Este contrato permite listar, vender e alugar NFTs da coleção **TicketNFT**, além de gerenciar taxas de plataforma e royalties para clubes.

---

## 🚀 Pré-requisitos para interagir

- O **Marketplace** deve ser aprovado (`approve`) para transferir o NFT (`TicketNFT`) em seu nome.
- Para **comprar** ou **alugar**, o usuário precisa:
  - Ter saldo suficiente em **fan tokens** (ERC20) associados ao clube do NFT.
  - Ter autorizado (`approve`) o Marketplace para gastar esses fan tokens.

---

## 🏛️ Estrutura Principal

- **ticketNFT** (`address`) → Endereço do contrato de NFTs (TicketNFT).
- **platformFeeBps** (`uint96`) → Taxa de plataforma em basis points (500 = 5%).
- **platformReceiver** (`address`) → Quem recebe as taxas de plataforma.
- **fanTokens** (`clubId => address`) → Token ERC20 usado para cada clube.
- **clubReceivers** (`clubId => address`) → Quem recebe a parte do clube.
- **allowedExecutors** (`address => bool`) → Endereços autorizados a executar certas funções administrativas (ex.: saque de NFTs alugados expirados).

---

## 📜 Funções públicas principais

### Venda

| Função | Quem pode chamar | Descrição |
|:---|:---|:---|
| `listForSale(tokenId, price)` | Proprietário do NFT | Lista um NFT para venda |
| `editSaleListing(tokenId, price)` | Vendedor original | Edita o preço de uma venda ativa |
| `cancelSaleListing(tokenId)` | Vendedor original | Cancela uma venda ativa |
| `buy(tokenId)` | Qualquer comprador | Compra o NFT listado |

---

### Aluguel

| Função | Quem pode chamar | Descrição |
|:---|:---|:---|
| `listForRent(tokenId, pricePerDay, maxDuration, minDuration)` | Proprietário do NFT | Lista um NFT para aluguel |
| `editRentListing(tokenId, pricePerDay, maxDuration, minDuration)` | Proprietário original | Edita os termos de aluguel |
| `cancelRentListing(tokenId)` | Proprietário original | Cancela uma listagem de aluguel |
| `rent(tokenId, durationDays)` | Qualquer usuário | Aluga um NFT para determinado número de dias |
| `withdrawRentedNFT(tokenId)` | Dono, inquilino ou executor autorizado | Retira o NFT do Marketplace após o aluguel expirar |

---

### Administração (Somente Owner)

| Função | Quem pode chamar | Descrição |
|:---|:---|:---|
| `setFanToken(clubId, tokenAddress)` | Owner | Define o fan token de um clube |
| `setClubReceiver(clubId, receiverAddress)` | Owner | Define o receiver de royalties do clube |
| `setPlatformFee(feeBps)` | Owner | Altera a taxa da plataforma (máx. 10%) |
| `setPlatformReceiver(receiverAddress)` | Owner | Altera o receiver da taxa de plataforma |
| `setExecutors(executor, allowed)` | Owner | Define se um endereço pode ser executor autorizado |

---

## 📦 Dados auxiliares disponíveis

| Função | Retorno |
|:---|:---|
| `getFanToken(clubId)` | Endereço do fan token do clube |
| `getClubReceiver(clubId)` | Endereço do receiver de royalties do clube |
| `getPlatformFee()` | Taxa da plataforma atual |
| `getPlatformReceiver()` | Receiver atual da taxa da plataforma |
| `getOwner()` | Endereço do dono do contrato |
| `getActiveRentInfo(tokenId)` | Informações sobre aluguel ativo do NFT |
| `getActiveListings(tokenId)` | Retorna as informações de venda e aluguel atuais de um NFT |
| `getPriceToRent(tokenId, daysCount)` | Calcula o custo para alugar um NFT por `daysCount` dias |
| `isRentalActive(tokenId)` | Verifica se o aluguel de um NFT ainda está ativo |

---

## 🔐 Modificadores e Proteções

- Todas funções de transferência são protegidas por **`nonReentrant`** (protege contra ataques de reentrância).
- Funções administrativas usam **`onlyOwner`**.
- Vários `require` e `custom errors` protegem a lógica (ex.: `NotOwner()`, `InvalidPrice()`, `AlreadyListed()`).

---

## ⚙️ Fluxo de Transações

1. **Vender**:
   - `listForSale` → `buy`
2. **Alugar**:
   - `listForRent` → `rent` → `withdrawRentedNFT` (após expiração)

Todas as transações envolvendo fan tokens:
- Retêm taxas de plataforma e de clube automaticamente.
- Garantem o reembolso ao comprador caso algo dê errado durante o `safeTransferFrom`.

---

## 📢 Observações importantes

- A transferência de NFTs só acontece se todas as condições forem atendidas.
- Se a transferência de NFT falhar, o comprador é **automaticamente reembolsado**.
- O Marketplace precisa ser aprovado pelo `TicketNFT` antes de listar/alugar NFTs.

---

# 📚 Exemplo de Interação com Web3

```javascript
const marketplace = new web3.eth.Contract(marketplaceAbi, marketplaceAddress);

// Listar para venda
await marketplace.methods.listForSale(tokenId, priceInWei).send({ from: userAddress });

// Comprar NFT
await marketplace.methods.buy(tokenId).send({ from: userAddress });
```

---

# 🛡️ Eventos emitidos

| Evento | Quando é emitido |
|:---|:---|
| `NFTListedForSale` | Quando um NFT é listado para venda |
| `SaleListingEdited` | Quando o preço da venda é editado |
| `NFTSold` | Quando um NFT é vendido |
| `NFTListedForRent` | Quando um NFT é listado para aluguel |
| `RentListingEdited` | Quando o preço ou duração do aluguel é alterado |
| `NFTRented` | Quando um NFT é alugado |
| `SaleListingCancelled` | Quando uma venda é cancelada |
| `RentListingCancelled` | Quando um aluguel é cancelado |

---

# 📌 Conclusão

Este Marketplace foi desenhado para:

- **Comprar e alugar NFTs de temporada de futebol**.
- **Cobrar taxas automáticas para a plataforma e os clubes**.
- **Ter segurança em todas as operações** (transações revertidas, reembolsos automáticos, proteções de reentrância).

É ideal para integrar facilmente com **frontends Web3** como React, Next.js, etc.
