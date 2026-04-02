import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const getPaymentByEventId = internalQuery({
  args: { eventId: v.string() },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_event_id", (q) => q.eq("eventId", eventId))
      .unique();
  },
});

export const recordPaymentAndUpgrade = internalMutation({
  args: {
    userId: v.id("users"),
    eventId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
  },
  handler: async (ctx, { userId, eventId, amount, currency, status }) => {
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_event_id", (q) => q.eq("eventId", eventId))
      .unique();

    if (existing) {
      return { duplicate: true };
    }

    await ctx.db.insert("payments", {
      userId,
      eventId,
      amount,
      currency,
      status,
      createdAt: Date.now(),
    });

    await ctx.db.patch(userId, { plan: "PRO" });

    return { duplicate: false };
  },
});

export const getAdminPaymentSummary = query({
  args: {},
  handler: async (ctx) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Not authenticated.");

    const caller = await ctx.db.get(callerId);
    if (!caller || caller.role !== "ADMIN") {
      throw new Error("Access denied. Admins only.");
    }

    const users = await ctx.db.query("users").collect();

    const summary = await Promise.all(
      users.map(async (user) => {
        const payments = await ctx.db
          .query("payments")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .order("desc")
          .take(1);

        const lastPayment = payments[0] ?? null;

        return {
          userId: user._id,
          email: user.email,
          name: user.name ?? "Unknown",
          plan: user.plan,
          role: user.role,
          lastPaymentStatus: lastPayment?.status ?? null,
          lastPaymentDate: lastPayment?.createdAt ?? null,
          lastPaymentAmount: lastPayment?.amount ?? null,
          lastPaymentCurrency: lastPayment?.currency ?? null,
        };
      }),
    );

    return summary;
  },
});

export const getMyPayments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
