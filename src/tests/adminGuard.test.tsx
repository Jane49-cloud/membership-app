import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import AdminGuard from "@/components/AdminGuard";

function renderGuard(role: "ADMIN" | "USER" | null | undefined) {
  return render(
    <MemoryRouter>
      <AdminGuard role={role}>
        <div data-testid="admin-content">Secret admin content</div>
      </AdminGuard>
    </MemoryRouter>,
  );
}

describe("AdminGuard", () => {
  it("renders children when user is ADMIN", () => {
    renderGuard("ADMIN");
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("blocks content when user is USER", () => {
    renderGuard("USER");
    expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
  });

  it("renders nothing when role is null", () => {
    const { container } = renderGuard(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows loading spinner when role is undefined", () => {
    const { container } = renderGuard(undefined);
    expect(container.querySelector(".spinner")).toBeInTheDocument();
  });
});
