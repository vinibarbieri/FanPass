const { ethers } = require("ethers");

// Defina a URL do provedor RPC (pode ser o de uma rede como Ethereum, Rinkeby, etc.)
const RPC_URL = process.env.RPC_URL; // Substitua com seu ID do Infura

const provider = new ethers.JsonRpcProvider(RPC_URL);

async function createBiconomyWallet() {
  const wallet = ethers.Wallet.createRandom(); // Gera uma nova carteira aleatória
  const walletWithProvider = wallet.connect(provider); // Conecta a carteira com o provedor

  // Verifique se o endereço da carteira é válido
  const publicKey = walletWithProvider.address;

  if (!publicKey) {
    throw new Error("Failed to generate wallet address");
  }

  return publicKey;
}

module.exports = createBiconomyWallet;
