import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ProGuard from "@/components/ProGuard";

function renderGuard(plan: "FREE" | "PRO" | null | undefined) {
  return render(
    <MemoryRouter>
      <ProGuard plan={plan}>
        <div data-testid="protected-content">Secret PRO content</div>
      </ProGuard>
    </MemoryRouter>,
  );
}

describe("ProGuard", () => {
  it("renders children when plan is PRO", () => {
    renderGuard("PRO");
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("blocks content and shows upgrade prompt when plan is FREE", () => {
    renderGuard("FREE");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("pro-guard-blocked")).toBeInTheDocument();
    expect(screen.getByText(/This one's for PRO members/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /See what's included/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing while plan is loading (null)", () => {
    const { container } = renderGuard(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a loading spinner while plan is undefined", () => {
    const { container } = renderGuard(undefined);
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pro-guard-blocked")).not.toBeInTheDocument();
  });

  it("upgrade link points to /billing", () => {
    renderGuard("FREE");
    const link = screen.getByRole("link", { name: /See what's included/i });
    expect(link).toHaveAttribute("href", "/billing");
  });
});
