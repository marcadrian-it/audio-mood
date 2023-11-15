import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import History from "@/app/(dashboard)/history/page";
import ResizeObserver from "resize-observer-polyfill";

// polyfill for ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserver;
}

// Create a mock for auth
const mocks = vi.hoisted(() => {
  return {
    auth: vi.fn(),
    prisma: {
      user: {
        findUniqueOrThrow: vi.fn(),
      },
      analysis: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@clerk/nextjs", () => {
  return {
    auth: mocks.auth,
  };
});

vi.mock("@/utils/db", () => {
  return {
    prisma: mocks.prisma,
  };
});

// Mock the next/font/google package
vi.mock("next/font/google", () => {
  return {
    Inter: () => ({ className: "inter" }),
  };
});
describe("HistoryPage", () => {
  test("renders average sentiment correctly", async () => {
    mocks.auth.mockResolvedValue({
      userId: "user_1",
    });
    const mockUser = {
      id: "user_1",
    };
    const mockAnalyses = [
      {
        id: "analysis_1",
        createdAt: new Date(),
        updatedAt: new Date(),
        entryId: "entry_1",
        userId: "user_1",
        sentimentScore: 0.5,
        mood: "happy",
        summary: "This is a summary",
        color: "#000000",
        negative: false,
        subject: "This is a subject",
      },
      {
        id: "analysis_2",
        createdAt: new Date(),
        updatedAt: new Date(),
        entryId: "entry_2",
        userId: "user_1",
        sentimentScore: 0.7,
        mood: "sad",
        summary: "This is another summary",
        color: "#FFFFFF",
        negative: true,
        subject: "This is another subject",
      },
    ];

    mocks.prisma.analysis.findMany.mockResolvedValueOnce(mockAnalyses);
    mocks.prisma.user.findUniqueOrThrow.mockResolvedValueOnce(mockUser);
    render(await History());

    // Check if the average sentiment is displayed correctly
    const avgSentimentElement = await screen.findByText(/Avg\. Sentiment \d+/);
    expect(avgSentimentElement?.textContent).not.toBeNull();

    // Check if the correct average sentiment value is displayed
    const avgSentimentValue = parseFloat(
      avgSentimentElement?.textContent?.match(/-?\d+(\.\d+)?/)?.[0] || "0"
    );

    const expectedAvgSentiment =
      Math.round(((0.5 + 0.7) / mockAnalyses.length) * 10) / 10;

    expect(avgSentimentValue).toBe(expectedAvgSentiment);
  });
});
