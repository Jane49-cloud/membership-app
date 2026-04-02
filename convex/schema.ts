import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.string(),
    plan: v.union(v.literal("FREE"), v.literal("PRO")),
    role: v.union(v.literal("USER"), v.literal("ADMIN")),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  payments: defineTable({
    userId: v.id("users"),
    eventId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event_id", ["eventId"]),
});
