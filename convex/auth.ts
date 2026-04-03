import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub],

  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const existingUser = args.existingUserId
        ? await ctx.db.get(args.existingUserId)
        : null;

      if (existingUser) {
        // Update email/name/image if they changed but keep plan and role
        await ctx.db.patch(existingUser._id, {
          email: args.profile.email as string,
          name: args.profile.name as string | undefined,
          image: args.profile.image as string | undefined,
        });
        return existingUser._id;
      }

      const userId = await ctx.db.insert("users", {
        email: args.profile.email as string,
        name: args.profile.name as string | undefined,
        image: args.profile.image as string | undefined,
        plan: "FREE",
        role: "USER",
      });

      return userId;
    },
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan ?? "FREE",
      role: user.role ?? "USER",
    };
  },
});

export const makeAdmin = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) throw new Error(`No user found with email: ${email}`);
    await ctx.db.patch(user._id, { role: "ADMIN" });
    return { success: true };
  },
});
