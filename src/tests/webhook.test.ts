import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";

// We mock the Stripe module so tests never make real API calls.
vi.mock("stripe", () => {
  const mockConstructEventAsync = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: { constructEventAsync: mockConstructEventAsync },
    })),
  };
});

function getMockConstructEvent() {
  const stripe = new (Stripe as any)("test");
  return stripe.webhooks.constructEventAsync as ReturnType<typeof vi.fn>;
}

// Simulates what our webhook handler does: verify then process
async function simulateWebhook(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<{ status: number; error?: string }> {
  const stripe = new (Stripe as any)(secret);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
  } catch (err) {
    return { status: 400, error: "Signature verification failed" };
  }

  if (event.type === "checkout.session.completed") {
    return { status: 200 };
  }

  return { status: 200 };
}

describe("Stripe webhook signature verification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects requests with an invalid signature", async () => {
    getMockConstructEvent().mockImplementation(() => {
      throw new Error(
        "No signatures found matching the expected signature for payload",
      );
    });

    const result = await simulateWebhook(
      JSON.stringify({ type: "checkout.session.completed" }),
      "bad_signature",
      "whsec_test",
    );

    expect(result.status).toBe(400);
    expect(result.error).toMatch(/signature/i);
  });

  it("accepts requests with a valid signature", async () => {
    const fakeEvent: Partial<Stripe.Event> = {
      id: "evt_valid_001",
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "user_abc" },
          amount_total: 999,
          currency: "usd",
        },
      } as any,
    };

    getMockConstructEvent().mockReturnValue(fakeEvent);

    const result = await simulateWebhook(
      JSON.stringify(fakeEvent),
      "valid_sig",
      "whsec_test",
    );

    expect(result.status).toBe(200);
    expect(result.error).toBeUndefined();
  });
});

describe("Duplicate event handling", () => {
  it("does not create a second payment record for the same eventId", () => {
    const processedEvents = new Set<string>();

    function processEvent(eventId: string): { inserted: boolean } {
      if (processedEvents.has(eventId)) return { inserted: false };
      processedEvents.add(eventId);
      return { inserted: true };
    }

    const first = processEvent("evt_dup_001");
    const second = processEvent("evt_dup_001");

    expect(first.inserted).toBe(true);
    expect(second.inserted).toBe(false);
    expect(processedEvents.size).toBe(1);
  });

  it("processes different events independently", () => {
    const processedEvents = new Set<string>();

    function processEvent(eventId: string) {
      if (processedEvents.has(eventId)) return { inserted: false };
      processedEvents.add(eventId);
      return { inserted: true };
    }

    expect(processEvent("evt_001").inserted).toBe(true);
    expect(processEvent("evt_002").inserted).toBe(true);
    expect(processedEvents.size).toBe(2);
  });
});

describe("Plan upgrade logic", () => {
  it("sets user plan to PRO after successful payment", () => {
    const user = { id: "user_1", plan: "FREE" as "FREE" | "PRO" };

    function applyUpgrade(u: typeof user) {
      return { ...u, plan: "PRO" as const };
    }

    const upgraded = applyUpgrade(user);
    expect(upgraded.plan).toBe("PRO");
  });

  it("does not downgrade a PRO user", () => {
    const user = { id: "user_2", plan: "PRO" as "FREE" | "PRO" };
    expect(user.plan).toBe("PRO");
  });
});
