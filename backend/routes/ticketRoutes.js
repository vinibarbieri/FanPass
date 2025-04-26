const express = require("express");
const TicketController = require("../controllers/ticketController");

const router = express.Router();
const ticketController = new TicketController();

router.get("/:id", ticketController.getTicketInfo.bind(ticketController));
router.post(
  "/:tokenId/details",
  ticketController.setTicketDetails.bind(ticketController)
);
router.get(
  "/:userId/tickets",
  ticketController.getTicketsByOwner.bind(ticketController)
);

module.exports = router;
