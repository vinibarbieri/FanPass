# 📄 Marketplace Smart Contract - Guia Atualizado

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
- **platformFeeBps** (`uint96`) → Taxa de plataforma em basis points (500 = 5% padrão).
- **platformReceiver** (`address`) → Destinatário das taxas de plataforma.
- **fanTokens** (`clubId => address`) → Token ERC20 usado para cada clube.
- **clubReceivers** (`clubId => address`) → Destinatário dos royalties dos clubes.
- **allowedExecutors** (`address => bool`) → Endereços autorizados a sacar NFTs alugados após expiração.

---

## 📜 Funções Públicas Principais

### Venda

| Função | Quem pode chamar | Descrição |
|:---|:---|:---|
| `listForSale(tokenId, price)` | Proprietário do NFT | Lista um NFT para venda |
| `editSaleListing(tokenId, price)` | Vendedor original | Edita o preço da venda |
| `cancelSaleListing(tokenId)` | Vendedor original | Cancela uma venda ativa |
| `buy(tokenId)` | Qualquer usuário | Compra um NFT listado usando fan tokens |

---

### Aluguel

| Função | Quem pode chamar | Descrição |
|:---|:---|:---|
| `listForRent(tokenId, pricePerDay, maxDuration, minDuration)` | Proprietário do NFT | Lista um NFT para aluguel |
| `editRentListing(tokenId, pricePerDay, maxDuration, minDuration)` | Proprietário original | Edita termos de aluguel |
| `cancelRentListing(tokenId)` | Proprietário original | Cancela uma listagem de aluguel |
| `rent(tokenId, durationDays)` | Qualquer usuário | Aluga um NFT por determinado número de dias |
| `withdrawRentedNFT(tokenId)` | Dono, inquilino ou executor autorizado | Retira o NFT do Marketplace após o aluguel expirar |

---

### Consulta de Listagens

| Função | Retorno | Descrição |
|:---|:---|:---|
| `getActiveListings(tokenId)` | (SaleListing, RentListing) | Retorna info de venda e aluguel de um token |
| `getActiveSaleListings()` | SaleListing[] | Lista todos os NFTs à venda |
| `getActiveRentListings()` | RentListing[] | Lista todos os NFTs para aluguel |
| `getActiveRentInfo(tokenId)` | RentInfo | Retorna detalhes do aluguel ativo de um NFT |
| `getPriceToRent(tokenId, daysCount)` | uint256 | Calcula o preço de aluguel para `daysCount` dias |
| `isRentalActive(tokenId)` | bool | Verifica se o aluguel está ativo |

---

### Administração (Somente Owner)

| Função | Quem pode chamar | Descrição |
|:---|:---|:---|
| `setFanToken(clubId, tokenAddress)` | Owner | Define o fan token de um clube |
| `getFanToken(clubId)` | Owner | Consulta o fan token de um clube |
| `setClubReceiver(clubId, receiverAddress)` | Owner | Define o receiver de royalties do clube |
| `getClubReceiver(clubId)` | Owner | Consulta o receiver do clube |
| `setPlatformFee(bps)` | Owner | Define a taxa da plataforma (0 < fee ≤ 10%) |
| `setPlatformReceiver(receiverAddress)` | Owner | Define o receiver da taxa da plataforma |
| `setExecutors(executor, allowed)` | Owner | Autoriza ou remove autorização de executores |
| `setOwner(newOwner)` | Owner | Transfere a propriedade do contrato |

---

## 📦 Estruturas Internas

### SaleListing
```solidity
struct SaleListing {
    uint256 tokenId;
    address seller;
    uint256 price;
    bool active;
    uint256 index;
}
```
Informações de uma venda ativa.

---

### RentListing
```solidity
struct RentListing {
    uint256 tokenId;
    address owner;
    uint256 pricePerDay;
    uint256 maxDuration;
    uint256 minDuration;
    bool active;
    uint256 index;
}
```
Informações de uma listagem para aluguel.

---

### RentInfo
```solidity
struct RentInfo {
    uint256 tokenId;
    address owner;
    address renter;
    uint256 expiresAt;
    bool active;
}
```
Informações de um aluguel ativo.

---

## 🔐 Segurança

- Todas operações críticas são protegidas com **`nonReentrant`** (proteção contra reentrância).
- Controle rigoroso de propriedade via **`onlyOwner`**.
- **Custom Errors** foram usados para otimizar gas e tornar falhas mais claras (ex.: `InvalidPrice()`, `NotOwner()`, `AlreadyListed()`).
- Todas transferências de tokens e NFTs estão envoltas em `try-catch` com reembolso garantido em caso de erro.

---

## ⚙️ Fluxo de Transações

1. **Venda**:
   - `listForSale(tokenId, price)`
   - `buy(tokenId)` → marketplace transfere NFT + distribui tokens ao vendedor, clube e plataforma.
2. **Aluguel**:
   - `listForRent(tokenId, pricePerDay, maxDuration, minDuration)`
   - `rent(tokenId, durationDays)` → marketplace transfere NFT temporariamente para si mesmo.
   - `withdrawRentedNFT(tokenId)` → NFT é devolvido ao dono após aluguel expirar.

---

## 📢 Eventos Emitidos

| Evento | Quando é emitido |
|:---|:---|
| `NFTListedForSale(tokenId, seller, price)` | Quando um NFT é listado para venda |
| `SaleListingEdited(tokenId, seller, price)` | Quando a venda é editada |
| `NFTSold(tokenId, buyer, seller, price)` | Quando o NFT é vendido |
| `NFTListedForRent(tokenId, owner, pricePerDay, maxDuration, minDuration)` | Quando um NFT é listado para aluguel |
| `RentListingEdited(tokenId, owner, pricePerDay, maxDuration, minDuration)` | Quando o aluguel é editado |
| `NFTRented(tokenId, renter, owner, durationDays, pricePerDay)` | Quando um NFT é alugado |
| `SaleListingCancelled(tokenId)` | Quando uma venda é cancelada |
| `RentListingCancelled(tokenId)` | Quando um aluguel é cancelado |

---

## 📚 Exemplo de Integração Web3

```javascript
const marketplace = new web3.eth.Contract(marketplaceAbi, marketplaceAddress);

// Listar um NFT para venda
await marketplace.methods.listForSale(tokenId, priceInWei).send({ from: userAddress });

// Comprar um NFT
await marketplace.methods.buy(tokenId).send({ from: userAddress });

// Listar um NFT para aluguel
await marketplace.methods.listForRent(tokenId, pricePerDayInWei, maxDays, minDays).send({ from: userAddress });

// Alugar um NFT
await marketplace.methods.rent(tokenId, durationDays).send({ from: userAddress });
```

---

# 📌 Observações Importantes

- O NFT precisa estar aprovado (`approve`) para o Marketplace realizar transferências.
- Se a transferência de NFT falhar por qualquer motivo, o comprador é **automaticamente reembolsado**.
- As taxas são divididas entre o **clube** e a **plataforma** automaticamente nas vendas e nos aluguéis.
- Tokens e NFTs são transferidos apenas se **todas as condições forem satisfeitas**.
