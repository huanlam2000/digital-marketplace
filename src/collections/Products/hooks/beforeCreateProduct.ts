import { stripe } from "../../../lib/stripe";
import { BeforeChangeHook } from "payload/dist/collections/config/types";

import { Product } from "@/payload-types";

export const createStripeProduct: BeforeChangeHook<Product> = async (args) => {
  console.log("hahaha");
  if (args.operation === "create") {
    const data = args.data as Product;

    const createdProduct = await stripe.products.create({
      name: data.name,
      default_price_data: {
        currency: "USD",
        unit_amount: Math.round(data.price * 100),
      },
    });

    const updated: Product = {
      ...data,
      stripeId: createdProduct.id,
      priceId: createdProduct.default_price as string,
    };

    return updated;
  } else if (args.operation === "update") {
    const data = args.data as Product;

    const updatedProduct = await stripe.products.update(data.stripeId!, {
      name: data.name,
      default_price: data.priceId!,
    });

    const updated: Product = {
      ...data,
      stripeId: updatedProduct.id,
      priceId: updatedProduct.default_price as string,
    };

    return updated;
  }
};
