import { getStripeClient } from "./stripeClient";

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = getStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createProduct(name: string, description?: string, metadata?: Record<string, string>) {
    const stripe = getStripeClient();
    return await stripe.products.create({
      name,
      description,
      metadata,
    });
  }

  async createPrice(productId: string, amount: number, currency: string = "usd") {
    const stripe = getStripeClient();
    return await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency,
    });
  }

  async listProducts() {
    const stripe = getStripeClient();
    return await stripe.products.list({ limit: 100, active: true });
  }

  async listPrices() {
    const stripe = getStripeClient();
    return await stripe.prices.list({ limit: 100, active: true });
  }
}

export const stripeService = new StripeService();
