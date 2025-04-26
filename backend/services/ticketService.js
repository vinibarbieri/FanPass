const { JsonRpcProvider, Contract, Wallet } = require("ethers");
const ticketAbi = require("../abi/TicketNFT.json").abi;
const TicketDetails = require("../models/ticketDetails");
const { getFanTokenToBRLPrice } = require("./fanTokenService");
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // TTL de 1 hora (3600 segundos)

class TicketService {
  constructor() {
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
    this.contract = new Contract(
      process.env.CONTRACT_ADDRESS,
      ticketAbi,
      this.provider
    );
    this.contractWithSigner = this.contract.connect(this.wallet);
  }

  async getTicketInfo(tokenId) {
    try {
      // Primeiro, tenta buscar as informações no cache
      const cachedData = myCache.get(tokenId);
      if (cachedData) {
        console.log("Dados encontrados no cache");
        return cachedData;
      }

      // Se não estiver no cache, faça as requisições
      const [info, tokenURI, isValid, details] = await Promise.all([
        this.contract.getPassInfo(tokenId),
        this.contract.tokenURI(tokenId),
        this.contract.isValid(tokenId),
        TicketDetails.findOne({ tokenId }),
      ]);

      // Conversão de fan token para BRL (com acréscimo de 30%)
      let priceInBRL = null;
      let tokenToBRL = null;
      if (details?.priceFanToken) {
        tokenToBRL = await getFanTokenToBRLPrice(); // "chiliz" como default
        if (tokenToBRL) {
          const rawValue = parseFloat(details.priceFanToken) * tokenToBRL;
          priceInBRL = (rawValue * 1.3).toFixed(2); // 30% a mais
        }
      }

      // Organiza os dados para retornar
      const result = {
        sector: info.sector,
        clubId: info.clubId.toString(),
        validFrom: info.validFrom.toString(),
        validUntil: info.validUntil.toString(),
        tokenURI,
        isValid,
        details: details || null,
        priceConversion: priceInBRL
          ? {
              fanToken: details.priceFanToken,
              reais: priceInBRL,
              rate: tokenToBRL,
            }
          : null,
      };

      // Armazena os dados no cache
      myCache.set(tokenId, result);

      return result;
    } catch (error) {
      throw new Error(`Failed to fetch ticket info: ${error.message}`);
    }
  }

  async mintTicket({ to, sector, clubId, validFrom, validUntil, tokenURI }) {
    try {
      const tx = await this.contractWithSigner.mint(
        to,
        sector,
        clubId,
        validFrom,
        validUntil,
        tokenURI
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to mint ticket: ${error.message}`);
    }
  }

  async saveTicketDetails(tokenId, details) {
    try {
      const update = {
        tokenId,
        ...details,
      };

      const options = { upsert: true, new: true }; // upsert cria se não encontrar o documento

      // Atualiza ou cria o ticketDetails no MongoDB
      return await TicketDetails.findOneAndUpdate({ tokenId }, update, options);
    } catch (error) {
      throw new Error(`Failed to save ticket details: ${error.message}`);
    }
  }

  async isOwner(tokenId, userAddress) {
    try {
      const isOwner = await this.contract.isOwner(tokenId, userAddress);
      return isOwner;
    } catch (error) {
      throw new Error(`Failed to check ownership: ${error.message}`);
    }
  }
  // async getTicketsByOwner(userId) {
  //   try {
  //     // 1. Busca o usuário no banco de dados
  //     const user = await User.findById(userId).lean();
  //     if (!user?.publicKey) {
  //       throw new Error("Usuário não possui carteira cadastrada");
  //     }

  //     // 2. Busca os eventos de Transfer para encontrar tokens recebidos pelo usuário
  //     const receivedFilter = this.contract.filters.Transfer(
  //       null,
  //       user.publicKey
  //     );
  //     const receivedEvents = await this.contract.queryFilter(receivedFilter);

  //     // 3. Busca os eventos de Transfer para encontrar tokens enviados pelo usuário
  //     const sentFilter = this.contract.filters.Transfer(user.publicKey, null);
  //     const sentEvents = await this.contract.queryFilter(sentFilter);

  //     // 4. Cria um mapa para rastrear a propriedade atual
  //     const tokenOwnership = new Map();

  //     // Processa eventos recebidos (aumenta o saldo)
  //     receivedEvents.forEach((event) => {
  //       const tokenId = event.args.tokenId.toString();
  //       tokenOwnership.set(tokenId, true);
  //     });

  //     // Processa eventos enviados (diminui o saldo)
  //     sentEvents.forEach((event) => {
  //       const tokenId = event.args.tokenId.toString();
  //       tokenOwnership.set(tokenId, false);
  //     });

  //     // 5. Filtra apenas os tokens que ainda são do usuário
  //     const ownedTokens = [];
  //     for (const [tokenId, isOwned] of tokenOwnership) {
  //       if (isOwned) {
  //         ownedTokens.push(tokenId);
  //       }
  //     }

  //     // 6. Obtém os detalhes dos tickets
  //     const userTickets = await Promise.all(
  //       ownedTokens.map(async (tokenId) => {
  //         try {
  //           const [tokenURI, passInfo, isValid] = await Promise.all([
  //             this.contract.tokenURI(tokenId),
  //             this.contract.getPassInfo(tokenId),
  //             this.contract.isValid(tokenId),
  //           ]);

  //           return {
  //             tokenId,
  //             tokenURI,
  //             sector: passInfo.sector,
  //             clubId: passInfo.clubId.toString(),
  //             validFrom: new Date(
  //               parseInt(passInfo.validFrom.toString()) * 1000
  //             ),
  //             validUntil: new Date(
  //               parseInt(passInfo.validUntil.toString()) * 1000
  //             ),
  //             isValid,
  //             owner: user.publicKey,
  //           };
  //         } catch (error) {
  //           console.error(`Erro ao processar token ${tokenId}:`, error.message);
  //           return null;
  //         }
  //       })
  //     );

  //     // Filtra quaisquer resultados nulos
  //     return userTickets.filter((ticket) => ticket !== null);
  //   } catch (error) {
  //     console.error("Erro ao buscar tickets:", error);
  //     throw new Error(`Falha ao listar ingressos: ${error.message}`);
  //   }
  // }
  async getTicketsByOwner(userId) {
    try {
      const ticket = await this.getTicketInfo(0);
      return [ticket];
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      throw new Error(`Falha ao listar ingressos: ${error.message}`);
    }
  }
}

module.exports = TicketService;
