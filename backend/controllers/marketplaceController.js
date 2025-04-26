const MarketplaceService = require("../services/marketplaceService");

class MarketplaceController {
  constructor(marketplaceService = new MarketplaceService()) {
    this.marketplaceService = marketplaceService;
  }

  // Endpoint to get details of a marketplace item (sale and rent listings)
  async getMarketplaceItem(req, res) {
    try {
      const { id } = req.params;

      // Validate item ID
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }

      // Fetch active listings (sale and rent) for the item
      const listings = await this.marketplaceService.getActiveListings(
        Number(id)
      );

      // Check if either sale or rent listing exists
      if (!listings.saleListing.active && !listings.rentListing.active) {
        return res.status(404).json({ error: "Item not listed" });
      }

      // Fetch additional rent info if rented
      let rentInfo = null;
      if (await this.marketplaceService.isRentalActive(Number(id))) {
        rentInfo = await this.marketplaceService.getActiveRentInfo(Number(id));
      }

      return res.status(200).json({
        tokenId: id,
        saleListing: listings.saleListing,
        rentListing: listings.rentListing,
        rentInfo: rentInfo,
      });
    } catch (error) {
      console.error(`Error fetching marketplace item: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }


  async listForSale(req, res) {
    try {
      const { itemId } = req.params;
      const { price, fromAddress } = req.body;

      const result = await this.marketplaceService.listNFTForSale({
        itemId,
        price,
        fromAddress,
      });

      return res.status(200).json({
        message: "NFT listed for sale successfully",
        transaction: result,
      });
    } catch (error) {
      console.error(`Error listing NFT for sale: ${error.message}`);
      return res
        .status(500)
        .json({ error: error.message || "Internal server error" });
    }
  }

  // Endpoint to list an NFT for rent
  async listForRent(req, res) {
    try {
      const { itemId } = req.params;
      const { pricePerDay, maxDuration, minDuration, fromAddress } = req.body;

      // Validate inputs
      if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }
      if (!pricePerDay || pricePerDay <= 0) {
        return res.status(400).json({ error: "Invalid price per day" });
      }
      if (!maxDuration || maxDuration <= 0) {
        return res.status(400).json({ error: "Invalid max duration" });
      }
      if (!minDuration || minDuration <= 0) {
        return res.status(400).json({ error: "Invalid min duration" });
      }
      if (
        !fromAddress ||
        !this.marketplaceService.web3.utils.isAddress(fromAddress)
      ) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // List NFT for rent
      const transaction = await this.marketplaceService.listForRent(
        Number(itemId),
        this.marketplaceService.web3.utils.toWei(
          pricePerDay.toString(),
          "ether"
        ),
        maxDuration,
        minDuration,
        fromAddress
      );

      return res.status(200).json({
        message: "NFT listed for rent successfully",
        transaction,
      });
    } catch (error) {
      console.error(`Error listing NFT for rent: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Endpoint to buy an NFT
  async buyNFT(req, res) {
    try {
      const { itemId } = req.params;
      const { fromAddress, price } = req.body;

      // Validate inputs
      if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }
      if (!price || price <= 0) {
        return res.status(400).json({ error: "Invalid price" });
      }
      if (
        !fromAddress ||
        !this.marketplaceService.web3.utils.isAddress(fromAddress)
      ) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Buy NFT
      const transaction = await this.marketplaceService.buyNFT(
        Number(itemId),
        fromAddress,
        this.marketplaceService.web3.utils.toWei(price.toString(), "ether")
      );

      return res.status(200).json({
        message: "NFT purchased successfully",
        transaction,
      });
    } catch (error) {
      console.error(`Error buying NFT: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Endpoint to rent an NFT
  async rentNFT(req, res) {
    try {
      const { itemId } = req.params;
      const { durationDays, fromAddress, totalPrice } = req.body;

      // Validate inputs
      if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }
      if (!durationDays || durationDays <= 0) {
        return res.status(400).json({ error: "Invalid duration" });
      }
      if (!totalPrice || totalPrice <= 0) {
        return res.status(400).json({ error: "Invalid total price" });
      }
      if (
        !fromAddress ||
        !this.marketplaceService.web3.utils.isAddress(fromAddress)
      ) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Rent NFT
      const transaction = await this.marketplaceService.rentNFT(
        Number(itemId),
        durationDays,
        fromAddress,
        this.marketplaceService.web3.utils.toWei(totalPrice.toString(), "ether")
      );

      return res.status(200).json({
        message: "NFT rented successfully",
        transaction,
      });
    } catch (error) {
      console.error(`Error renting NFT: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Endpoint to cancel a sale listing
  async cancelSaleListing(req, res) {
    try {
      const { itemId } = req.params;
      const { fromAddress } = req.body;

      // Validate inputs
      if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }
      if (
        !fromAddress ||
        !this.marketplaceService.web3.utils.isAddress(fromAddress)
      ) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Cancel sale listing
      const transaction = await this.marketplaceService.cancelSaleListing(
        Number(itemId),
        fromAddress
      );

      return res.status(200).json({
        message: "Sale listing canceled successfully",
        transaction,
      });
    } catch (error) {
      console.error(`Error canceling sale listing: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Endpoint to cancel a rent listing
  async cancelRentListing(req, res) {
    try {
      const { itemId } = req.params;
      const { fromAddress } = req.body;

      // Validate inputs
      if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }
      if (
        !fromAddress ||
        !this.marketplaceService.web3.utils.isAddress(fromAddress)
      ) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Cancel rent listing
      const transaction = await this.marketplaceService.cancelRentListing(
        Number(itemId),
        fromAddress
      );

      return res.status(200).json({
        message: "Rent listing canceled successfully",
        transaction,
      });
    } catch (error) {
      console.error(`Error canceling rent listing: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Endpoint to withdraw a rented NFT
  async withdrawRentedNFT(req, res) {
    try {
      const { itemId } = req.params;
      const { fromAddress } = req.body;

      // Validate inputs
      if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid item ID" });
      }
      if (
        !fromAddress ||
        !this.marketplaceService.web3.utils.isAddress(fromAddress)
      ) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Withdraw rented NFT
      const transaction = await this.marketplaceService.withdrawRentedNFT(
        Number(itemId),
        fromAddress
      );

      return res.status(200).json({
        message: "Rented NFT withdrawn successfully",
        transaction,
      });
    } catch (error) {
      console.error(`Error withdrawing rented NFT: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = MarketplaceController;

//AJUSTAR P/ CHILLIZ
//REMOVER O .WEB3 DO CONTROLLER E PASSAR PARA O SERVICE