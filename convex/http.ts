import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { Resend } from "resend";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rawBody = await request.text();

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(`Signature verification failed: ${message}`, {
        status: 400,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const userEmail = session.metadata?.userEmail ?? session.customer_email;

      if (!userId && !userEmail) {
        return new Response("Missing user info in metadata", { status: 400 });
      }

      let resolvedUserId: string | null = userId ?? null;

      if (!resolvedUserId && userEmail) {
        const user = await ctx.runQuery(internal.payments.getUserByEmail, {
          email: userEmail,
        });
        resolvedUserId = user?._id ?? null;
      }

      if (!resolvedUserId) {
        return new Response("User not found", { status: 404 });
      }

      const result = await ctx.runMutation(
        internal.payments.recordPaymentAndUpgrade,
        {
          userId: resolvedUserId as any,
          eventId: event.id,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          status: "paid",
        },
      );

      if (!result.duplicate && userEmail && process.env.RESEND_API_KEY) {
        await sendConfirmationEmail(userEmail);
      }
    }

    return new Response(null, { status: 200 });
  }),
});

async function sendConfirmationEmail(toEmail: string): Promise<void> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: toEmail,
      subject: "Welcome to PRO! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #7c3aed;">You're now a PRO member!</h2>
          <p>Thanks for upgrading. Your account has been updated and you now have full access to all PRO features.</p>
          <p>If you have any questions, just reply to this email.</p>
          <br/>
          <p style="color: #6b7280; font-size: 13px;">— The Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}

export default http;
