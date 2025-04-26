
# INTERAGINDO COM OS CONTRATOS

### Endereços

- **TICKET_NFT_ADDRESS** = `0x6915Dad8b70E1f6AC72731fF2f1CE8537D150b67`
- **MARKETPLACE** = `0x1323DDAFe3b91C295578e7a25CBb4b2FB3aE6a7f`
- **SPFC_FANTOKEN** = `0x828C11d2268d5873688DB829ef3a3f3E055D7B85`

---

## DEPLOY TICKETNFT

```bash
forge script script/Deploy.s.sol:DeployTicketNFT \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --gas-price 1000000000 \
  --legacy
```

---

## SET CONTROLLER ADDRESS

```bash
cast send \
  "$TICKET_NFT_ADDRESS" \
  "setController(address)" \
  "$CONTROLLER_ADDRESS" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$CHILIZ_RPC"
```

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
  --private-key "$PRIVATE_KEY" \
  --legacy
```

---

## DEPLOY MARKETPLACE.sol

```bash
forge script script/DeployMarketplace.s.sol:DeployMarketplace \
  --rpc-url "$CHILIZ_RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --gas-price 1000000000 \
  --legacy
```

---

## Listar NFT no Marketplace

```bash
cast send "$MARKETPLACE_ADDRESS" \
  "listForSale(uint256,uint256)" \
  0 \ 
  100 \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$CHILIZ_RPC" \
  --legacy
```
