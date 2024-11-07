import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import { Product } from "../payload-types";
import { TRPCError } from "@trpc/server";
import type Stripe from "stripe";
import { z } from "zod";

import { privateProcedure, router } from "./trpc";

export const paymentRouter = router({
  createSesstion: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { productIds } = input;

      if (productIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const payload = await getPayloadClient();

      const { docs: products } = (await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds,
          },
        },
      })) as unknown as { docs: Product[] };

      const filteredProducts = products.filter((prod) => Boolean(prod.priceId));

      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id),
          user: user.id,
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      filteredProducts.forEach((prod) =>
        line_items.push({ price: prod.priceId!, quantity: 1 }),
      );

      line_items.push({
        price: "price_1QINyN02QziMwoFk5VEVqzuj",
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card", "link", "cashapp", "amazon_pay"],
          mode: "payment",
          metadata: {
            userId: user.id,
            orderId: order.id,
          },
          line_items,
        });

        return { url: stripeSession.url };
      } catch (error) {
        console.log("Error: ", error);
        return { url: null };
      }
    }),
});
