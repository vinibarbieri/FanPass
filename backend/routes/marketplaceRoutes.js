const express = require("express");
const MarketplaceController = require("../controllers/marketplaceController");

const router = express.Router();
const marketplaceController = new MarketplaceController();

// Get marketplace item details (sale, rent, and rent info)
router.get(
  "/:id",
  marketplaceController.getMarketplaceItem.bind(marketplaceController)
);


// List an NFT for sale
router.post(
  "/:itemId/list-sale",
  marketplaceController.listForSale.bind(marketplaceController)
);

// List an NFT for rent
router.post(
  "/:itemId/list-rent",
  marketplaceController.listForRent.bind(marketplaceController)
);

// Buy an NFT
router.post(
  "/:itemId/buy",
  marketplaceController.buyNFT.bind(marketplaceController)
);

// Rent an NFT
router.post(
  "/:itemId/rent",
  marketplaceController.rentNFT.bind(marketplaceController)
);

// Cancel a sale listing
router.post(
  "/:itemId/cancel-sale",
  marketplaceController.cancelSaleListing.bind(marketplaceController)
);

// Cancel a rent listing
router.post(
  "/:itemId/cancel-rent",
  marketplaceController.cancelRentListing.bind(marketplaceController)
);

// Withdraw a rented NFT
router.post(
  "/:itemId/withdraw-rent",
  marketplaceController.withdrawRentedNFT.bind(marketplaceController)
);

module.exports = router;
