import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "@/app/page";
import ResizeObserver from "resize-observer-polyfill";

// polyfill for ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserver;
}

// Create a mock for auth
const mocks = vi.hoisted(() => {
  return {
    auth: vi.fn(),
  };
});

// Mock clerk auth
vi.mock("@clerk/nextjs", () => {
  return {
    auth: mocks.auth,
  };
});

// Mock the next/font/google package
vi.mock("next/font/google", () => {
  return {
    Inter: () => ({ className: "inter" }),
  };
});

describe("Homepage", () => {
  test(`Home`, async () => {
    mocks.auth.mockResolvedValue({
      userId: "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
    });

    render(await HomePage());
    expect(screen.getByText("Reflect as Marcus Aurelius")).toBeTruthy();
  });

  describe("Conditional rendering", () => {
    test(`Home with userId`, async () => {
      mocks.auth.mockResolvedValue({
        userId: "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
      });

      render(await HomePage());
      expect(screen.getByRole("link")).toHaveAttribute("href", "/journal");
    });

    test(`Home without userId`, async () => {
      mocks.auth.mockResolvedValue({ userId: null });

      render(await HomePage());
      expect(screen.getByRole("link")).toHaveAttribute("href", "/new-user");
    });
  });
});
