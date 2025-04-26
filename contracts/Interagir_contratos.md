
# INTERAGINDO COM OS CONTRATOS

### Endereços

- **TICKET_NFT_ADDRESS** = `0x6915Dad8b70E1f6AC72731fF2f1CE8537D150b67`
- **MARKETPLACE** = `0xe51E55B6917d5BA9e92D6C8B1Bb818e31708CA1d`
- **FANTOKEN** = `0x57caeaBaAF36245a63a65C4DB9C21a18a8A68D12`

---
# TicketNFT.sol

## DEPLOY TicketNFT.sol

```bash
forge script script/DeployTicketNFT.s.sol:DeployTicketNFT \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --gas-price 1000000000 \
  --legacy
```

---

## setController

```bash
cast send \
  "$TICKET_NFT_ADDRESS" \
  "setController(address)" \
  "$CONTROLLER_ADDRESS" \
  --private-key "$PRIVATE_KEY_OWNER" \
  --rpc-url "$CHILIZ_RPC" \
  --legacy
```

cast nonce "$TEST_ACCOUNT_ADDRESS" --rpc-url "$CHILIZ_RPC"


---

## Verificar Controller Address

```bash
cast call "$TICKET_NFT_ADDRESS" "controller()(address)" --rpc-url "$CHILIZ_RPC"
```

---

## Approve For All

```bash
cast send "$TICKET_NFT_ADDRESS" \
  "setApprovalForAll(address,bool)" \
  "$CONTROLLER_ADDRESS" true \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY_CONTA_PRINCIPAL" \
  --legacy
```

---

## Mint TicketNFT

```bash
cast send "$TICKET_NFT_ADDRESS" \
  "mint(address,string,uint256,uint256,uint256,string)" \
  "$TEST_ACCOUNT_ADDRESS" \
  "Camarote" \
  2 \
  1745664242 \
  1777211042 \
  "https://brown-obliged-albatross-730.mypinata.cloud/ipfs/bafybeiaxgq76eztb6v7gcx53pbtcklay5y7g4ah2xgyqc7wcc5kjlbgphu/token_uri12.json" \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --legacy
```

---
# Marketplace.sol

## DEPLOY Marketplace.sol

```bash
forge script script/DeployMarketplace.s.sol:DeployMarketplace \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY_OWNER" \
  --broadcast \
  --gas-price 1000000000 \
  --legacy
```

---

## Listar NFT para Venda no Marketplace

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "listForSale(uint256,uint256)" \
  7 \
  100 \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY_TEST_ACCOUNT" \
  --legacy
```

---

## Editar Listagem de Venda do NFT no Marketplace

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "editSaleListing(uint256,uint256)" \
  $TOKEN_ID \
  $NEW_PRICE \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --legacy
```

---

## Comprar NFT

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "buy(uint256)" \
  $TOKEN_ID \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --legacy
```

---

## Listar para Aluguel no Marketplace

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "listForRent(uint256,uint256,uint256,uint256)" \
  $TOKEN_ID \
  $PRICE_PER_DAY \
  $MAX_DURATION \
  $MIN_DURATION \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --legacy 
```

---

## Alugar NFT

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "rent(uint256,uint256)" \
  $TOKEN_ID \
  $DURATION_DAYS \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --legacy
```

---

## Finalizar Aluguel

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "withdrawRentedNFT(uint256)" \
  $TOKEN_ID \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --legacy
```

---

## Associar FanToken a um ClubId

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "setFanToken(uint256,address)" \
  1 \
  "$FANTOKEN_ADDRESS" \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY_TEST_ACCOUNT" \
  --legacy
```

---

## Retorna o tokenId de Todos NFTs a Venda

```bash
cast call "$MARKETPLACE_ADDRESS" \
  "getActiveSaleListings()((uint256,address,uint256,bool,uint256)[])" \
  --rpc-url "$CHILIZ_RPC"
```

---

## Retorna o tokenId de Todos NFTs para Alugar

```bash
cast call "$MARKETPLACE_ADDRESS" \
  "getActiveRentListings()((uint256,address,uint256,uint256,uint256,bool,uint256)[])" \
  --rpc-url "$CHILIZ_RPC"
```

---

# FanToken.sol

## Mint FanToken

```bash
cast send "$FANTOKEN_ADDRESS" \
  "mint(address,uint256)" \
  "$TEST_ACCOUNT_ADDRESS" \
  1000000000 \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY_TEST_ACCOUNT" \
  --legacy
```
