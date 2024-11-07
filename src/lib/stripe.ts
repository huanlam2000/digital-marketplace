import Stripe from "stripe";

console.log("stripe run", process.env.STRIPE_SECRET_KEY);
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});
