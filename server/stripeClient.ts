import Stripe from "stripe";

export function getStripeStatus() {
  const hasSecret = !!process.env.STRIPE_SECRET_KEY;
  const hasPublishable = !!process.env.STRIPE_PUBLISHABLE_KEY;
  return {
    configured: hasSecret && hasPublishable,
    hasSecretKey: hasSecret,
    hasPublishableKey: hasPublishable,
  };
}

// Get Stripe keys from environment variables
export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error(
      "Stripe not configured. Add STRIPE_SECRET_KEY to Replit secrets from https://dashboard.stripe.com/apikeys"
    );
  }

  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Stripe not configured. Add STRIPE_PUBLISHABLE_KEY to Replit secrets from https://dashboard.stripe.com/apikeys"
    );
  }
  return key;
}
