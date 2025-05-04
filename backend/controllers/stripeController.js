const StripeService = require("../services/stripeService");

class StripeController {
  constructor() {
    this.stripeService = new StripeService();
  }

  createSession = async (req, res) => {
    try {
      const { items, successUrl, cancelUrl } = req.body;

      if (!items || !successUrl || !cancelUrl) {
        return res.status(400).json({ error: "Missing required parameters." });
      }

      const session = await this.stripeService.createCheckoutSession(
        items,
        successUrl,
        cancelUrl
      );

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error.message);
      res.status(500).json({ error: "Failed to create checkout session." });
    }
  };
}

module.exports = StripeController;
