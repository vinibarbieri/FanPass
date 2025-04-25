const { JsonRpcProvider, Contract, Wallet } = require("ethers");
const ticketAbi = require("../abi/TicketNFT.json");
const TicketDetails = require("../models/ticketDetails");
const { getFanTokenToBRLPrice } = require("./fanTokenService");

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

      return {
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
}

module.exports = TicketService;
