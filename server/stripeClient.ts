import Stripe from "stripe";

// Get Stripe keys from environment variables
export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY not found. Please add it to your Replit secrets."
    );
  }

  return new Stripe(secretKey, {
    apiVersion: "2024-12-27.acacia",
  });
}

export async function getStripePublishableKey() {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_PUBLISHABLE_KEY not found. Please add it to your Replit secrets."
    );
  }
  return key;
}
