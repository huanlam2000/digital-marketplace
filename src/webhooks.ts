import express, { RequestHandler } from "express";
import { Resend } from "resend";
import type { Stripe } from "stripe";

import { ReceiptEmailHtml } from "./components/ReceiptEmail";
import { getPayloadClient } from "./get-payload";
import { stripe } from "./lib/stripe";
import { Product, User } from "./payload-types";
import { WebhookRequest } from "./server";

const resend = new Resend(process.env.RESEND_API_EY);

export const stripeWebhookHandler = async (
  req: express.Request,
  res: express.Response,
) => {
  // validate that this request actually comes from stripe
  // update _isPaid
  // send receipt email

  const webhookRequest = req as unknown as WebhookRequest;
  const body = webhookRequest.rawBody;
  const signature = req.headers["stripe-signature"] || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    res
      .status(400)
      .send(
        `Webhook Error: ${
          err instanceof Error ? err.message : "Unknown Error"
        }`,
      );
    throw err;
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    res.status(400).send(`Webhook Error: No user present in metadata`);
    throw new Error("Webhook Error: No user present in metadata");
  }

  if (event.type === "checkout.session.completed") {
    const payload = await getPayloadClient();

    const { docs: users } = await payload.find({
      collection: "users",
      where: {
        id: {
          equals: session.metadata.userId,
        },
      },
    });

    const [user] = users;

    if (!user) res.status(404).json({ error: "No such user exists." });

    const { docs: orders } = await payload.find({
      collection: "orders",
      depth: 2,
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    });

    const [order] = orders;

    if (!order) res.status(404).json({ error: "No such order exists." });

    await payload.update({
      collection: "orders",
      data: {
        _isPaid: true,
      },
      where: {
        id: {
          equals: session.metadata.orderId,
        },
      },
    });

    // send receipt
    try {
      const data = await resend.emails.send({
        from: "DigitalHippo <hello@joshtriedcoding.com>",
        to: [(user as unknown as User).email],
        subject: "Thanks for your order! This is your receipt.",
        html: await ReceiptEmailHtml({
          date: new Date(),
          email: (user as unknown as User).email,
          orderId: session.metadata.orderId,
          products: order.products as Product[],
        }),
      });
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  res.status(200).send();
};
