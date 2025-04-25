const mongoose = require("mongoose");

const ticketDetailsSchema = new mongoose.Schema({
  tokenId: { type: Number, required: true, unique: true },
  priceFanToken: { type: Number, required: true },
  status: {
    type: String,
    enum: ["à venda", "para alugar", "comprado", "alugado"],
    required: true,
  },
  ownerPublicKey: { type: String, required: true },
  lastTransactionDate: { type: Date, required: true },
});

module.exports = mongoose.model("TicketDetails", ticketDetailsSchema); // Nome correto do modelo
