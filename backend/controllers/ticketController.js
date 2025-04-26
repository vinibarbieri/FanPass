const TicketService = require("../services/ticketService");

class TicketController {
  constructor(ticketService = new TicketService()) {
    this.ticketService = ticketService;
  }

  async getTicketInfo(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const ticket = await this.ticketService.getTicketInfo(Number(id));
      return res.status(200).json(ticket);
    } catch (error) {
      console.error(`Error fetching ticket info: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async setTicketDetails(req, res) {
    try {
      const { tokenId } = req.params; // Pegando o tokenId da URL
      const { priceFanToken, status, ownerPublicKey, lastTransactionDate } =
        req.body;

      // Verifica se o tokenId foi fornecido
      if (!tokenId) {
        return res.status(400).json({ error: "TokenId is required" });
      }

      // Verifica se o campo status é válido
      const validStatuses = ["à venda", "para alugar", "comprado", "alugado"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Atualiza ou cria os detalhes do ticket
      const ticketDetails = await this.ticketService.saveTicketDetails(
        Number(tokenId),
        {
          priceFanToken,
          status,
          ownerPublicKey,
          lastTransactionDate: new Date(lastTransactionDate), // Garantir formato de data correto
        }
      );

      return res
        .status(200)
        .json({ message: "Ticket details saved successfully", ticketDetails });
    } catch (error) {
      console.error(`Error saving ticket details: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  // Adicione este método ao TicketController
  async getTicketsByOwner(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const tickets = await this.ticketService.getTicketsByOwner(userId);

      return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets,
      });
    } catch (error) {
      console.error(`Error fetching user tickets: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: "Failed to get tickets from blockchain",
        details: error.message,
      });
    }
  }
}

module.exports = TicketController;
