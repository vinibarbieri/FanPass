const { JsonRpcProvider, Contract, Wallet, parseEther } = require("ethers");
const ethers = require("ethers");

const marketplaceAbi = require("../abi/Marketplace.json").abi;
const TicketDetails = require("../models/ticketDetails");
const { getFanTokenToBRLPrice } = require("./fanTokenService");

class MarketplaceService {
  constructor() {
    // Criar provider com a URL do RPC
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
    console.log("Provider initialized with RPC URL:", process.env.RPC_URL);

    // Criar a carteira (wallet) com a chave privada e o provider
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
    console.log("Wallet initialized with provided private key.");

    // Inicializar contrato com o provider (somente leitura)
    this.contract = new Contract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      marketplaceAbi,
      this.provider
    );
    console.log(
      "Contract initialized with address:",
      process.env.MARKETPLACE_CONTRACT_ADDRESS
    );

    // Associar o contrato ao signer (permitindo enviar transações)
    this.contractWithSigner = this.contract.connect(this.wallet);
    console.log("Contract with signer initialized.");
  }

  // Check if NFT is listed for sale
  async isListedForSale(tokenId) {
    console.log(
      `Checking if NFT with tokenId ${tokenId} is listed for sale...`
    );
    try {
      const saleListing = await this.contract.saleListings(tokenId);
      console.log(`Sale Listing for tokenId ${tokenId}:`, saleListing);
      return saleListing.active;
    } catch (error) {
      console.error(
        `Error checking if NFT ${tokenId} is listed for sale:`,
        error
      );
      throw new Error(
        `Failed to check if NFT is listed for sale: ${error.message}`
      );
    }
  }

  async getActiveListings(tokenId) {
    console.log(`Fetching active listings for tokenId ${tokenId}...`);
    try {
      // Consulta as listagens de venda e aluguel no contrato
      const saleListing = await this.contract.saleListings(tokenId);
      const rentListing = await this.contract.rentListings(tokenId);
      console.log(`Sale Listing for tokenId ${tokenId}:`, saleListing);
      console.log(`Rent Listing for tokenId ${tokenId}:`, rentListing);

      // Obtenção dos detalhes de ticket a partir da base de dados
      const ticketDetails = await TicketDetails.findOne({ tokenId });
      console.log(`Ticket Details for tokenId ${tokenId}:`, ticketDetails);

      // Retorno de informações de listagem de venda e aluguel, incluindo conversão de preço para BRL
      let salePriceInBRL = null;
      let rentPriceInBRL = null;
      let tokenToBRL = null;

      // Se a listagem de venda for ativa e o preço estiver definido
      if (saleListing.active && saleListing.price) {
        if (ticketDetails?.priceFanToken) {
          tokenToBRL = await getFanTokenToBRLPrice();
          console.log(`Token to BRL conversion rate: ${tokenToBRL}`);
          if (tokenToBRL) {
            const saleRawValue =
              parseFloat(this.provider.utils.formatEther(saleListing.price)) *
              tokenToBRL;
            salePriceInBRL = (saleRawValue * 1.3).toFixed(2); // 30% de markup
            console.log(
              `Sale price in BRL for tokenId ${tokenId}: ${salePriceInBRL}`
            );
          }
        }
      }

      // Se a listagem de aluguel for ativa e o preço estiver definido
      if (rentListing.active && rentListing.pricePerDay) {
        if (ticketDetails?.priceFanToken) {
          tokenToBRL = await getFanTokenToBRLPrice();
          console.log(`Token to BRL conversion rate: ${tokenToBRL}`);
          if (tokenToBRL) {
            const rentRawValue =
              parseFloat(
                this.provider.utils.formatEther(rentListing.pricePerDay)
              ) * tokenToBRL;
            rentPriceInBRL = (rentRawValue * 1.3).toFixed(2); // 30% de markup
            console.log(
              `Rent price per day in BRL for tokenId ${tokenId}: ${rentPriceInBRL}`
            );
          }
        }
      }

      return {
        tokenId: tokenId.toString(),
        saleListing: {
          active: saleListing.active,
          seller: saleListing.seller,
          price: saleListing.price.toString(),
          priceInBRL: salePriceInBRL
            ? {
                fanToken: this.provider.utils.formatEther(saleListing.price),
                reais: salePriceInBRL,
                rate: tokenToBRL,
              }
            : null,
        },
        rentListing: {
          active: rentListing.active,
          owner: rentListing.owner,
          pricePerDay: rentListing.pricePerDay.toString(),
          maxDuration: rentListing.maxDuration.toString(),
          minDuration: rentListing.minDuration.toString(),
          priceInBRL: rentPriceInBRL
            ? {
                fanToken: this.provider.utils.formatEther(
                  rentListing.pricePerDay
                ),
                reais: rentPriceInBRL,
                rate: tokenToBRL,
              }
            : null,
        },
      };
    } catch (error) {
      console.error(
        `Error fetching active listings for tokenId ${tokenId}:`,
        error
      );
      throw new Error(`Failed to get active listings: ${error.message}`);
    }
  }

  // Get sale listing details with price conversion
  async getSaleListing(tokenId) {
    console.log(`Fetching sale listing details for tokenId ${tokenId}...`);
    try {
      const saleListing = await this.contract.saleListings(tokenId);
      console.log(`Sale Listing for tokenId ${tokenId}:`, saleListing);

      const ticketDetails = await TicketDetails.findOne({ tokenId });
      console.log(`Ticket Details for tokenId ${tokenId}:`, ticketDetails);

      // Convert price to BRL if available
      let priceInBRL = null;
      let tokenToBRL = null;
      if (saleListing.price && ticketDetails?.priceFanToken) {
        tokenToBRL = await getFanTokenToBRLPrice();
        console.log(`Token to BRL conversion rate: ${tokenToBRL}`);
        if (tokenToBRL) {
          const rawValue =
            parseFloat(this.provider.utils.formatEther(saleListing.price)) *
            tokenToBRL;
          priceInBRL = (rawValue * 1.3).toFixed(2); // 30% markup
          console.log(`Price in BRL for tokenId ${tokenId}: ${priceInBRL}`);
        }
      }

      return {
        tokenId: saleListing.tokenId.toString(),
        seller: saleListing.seller,
        price: saleListing.price.toString(),
        active: saleListing.active,
        priceConversion: priceInBRL
          ? {
              fanToken: this.provider.utils.formatEther(saleListing.price),
              reais: priceInBRL,
              rate: tokenToBRL,
            }
          : null,
      };
    } catch (error) {
      console.error(
        `Error fetching sale listing for tokenId ${tokenId}:`,
        error
      );
      throw new Error(`Failed to get sale listing: ${error.message}`);
    }
  }

  // Get rent listing details with price conversion
  async getRentListing(tokenId) {
    console.log(`Fetching rent listing details for tokenId ${tokenId}...`);
    try {
      const rentListing = await this.contract.rentListings(tokenId);
      console.log(`Rent Listing for tokenId ${tokenId}:`, rentListing);

      const ticketDetails = await TicketDetails.findOne({ tokenId });
      console.log(`Ticket Details for tokenId ${tokenId}:`, ticketDetails);

      let pricePerDayInBRL = null;
      let tokenToBRL = null;
      if (rentListing.pricePerDay && ticketDetails?.priceFanToken) {
        tokenToBRL = await getFanTokenToBRLPrice();
        console.log(`Token to BRL conversion rate: ${tokenToBRL}`);
        if (tokenToBRL) {
          const rawValue =
            parseFloat(
              this.provider.utils.formatEther(rentListing.pricePerDay)
            ) * tokenToBRL;
          pricePerDayInBRL = (rawValue * 1.3).toFixed(2); // 30% markup
          console.log(
            `Price per day in BRL for tokenId ${tokenId}: ${pricePerDayInBRL}`
          );
        }
      }

      return {
        tokenId: rentListing.tokenId.toString(),
        owner: rentListing.owner,
        pricePerDay: rentListing.pricePerDay.toString(),
        maxDuration: rentListing.maxDuration.toString(),
        minDuration: rentListing.minDuration.toString(),
        active: rentListing.active,
        priceConversion: pricePerDayInBRL
          ? {
              fanToken: this.provider.utils.formatEther(
                rentListing.pricePerDay
              ),
              reais: pricePerDayInBRL,
              rate: tokenToBRL,
            }
          : null,
      };
    } catch (error) {
      console.error(
        `Error fetching rent listing for tokenId ${tokenId}:`,
        error
      );
      throw new Error(`Failed to get rent listing: ${error.message}`);
    }
  }

  // Log transaction details for listing an NFT for sale
  async listNFTForSale({ itemId, price }) {
    if (!itemId || isNaN(itemId)) {
      console.error("Invalid item ID provided:", itemId);
      throw new Error("Invalid item ID");
    }

    if (!price || price <= 0) {
      console.error("Invalid price provided:", price);
      throw new Error("Invalid price");
    }

    const parsedPrice = parseEther(price.toString());
    console.log(
      `Listing NFT for sale with itemId ${itemId} and price ${price}...`
    );

    try {
      const tx = await this.contractWithSigner.listForSale(
        Number(itemId),
        parsedPrice
      );

      console.log(`Transaction sent to list NFT for sale:`, tx);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);

      return tx;
    } catch (error) {
      console.error("Error sending transaction to list NFT for sale:", error);
      throw new Error("Transaction failed");
    }
  }

  // Similar adjustments can be made to other methods
}

module.exports = MarketplaceService;
