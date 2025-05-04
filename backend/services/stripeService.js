const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

class StripeService {
  async createCheckoutSession(items, successUrl, cancelUrl) {
    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items must be a non-empty array.");
    }
    if (!successUrl || !cancelUrl) {
      throw new Error("successUrl and cancelUrl are required.");
    }

    const line_items = items.map((item) => {
      if (!item.name || !item.unit_amount || item.unit_amount <= 0) {
        throw new Error("Each item must have a valid name and unit_amount.");
      }

      // Prepare product_data with images if provided
      const product_data = {
        name: item.name,
        description: item.description || "",
      };

      // Include images if provided and valid
      if (item.image && typeof item.image === "string") {
        product_data.images = [item.image]; // Stripe expects an array of URLs
      }

      return {
        price_data: {
          currency: item.currency || "brl",
          product_data,
          unit_amount: Math.round(item.unit_amount), // Ensure integer in centavos
        },
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }
}

module.exports = StripeService;
