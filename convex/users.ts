import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";
import { internal } from "./_generated/api";

export const createCheckoutSession = action({
  args: {
    planId: v.optional(v.string()),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, { planId, successUrl, cancelUrl }): Promise<{ checkoutUrl: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to upgrade.");
    }

    const user = await ctx.runQuery(internal.payments.getUserById, { userId });
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.plan === "PRO") {
      throw new Error("You are already on the PRO plan.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: planId ?? process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        userEmail: user.email,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe checkout URL.");
    }

    return { checkoutUrl: session.url };
  },
});
