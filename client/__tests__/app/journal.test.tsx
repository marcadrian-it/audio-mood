import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import JournalPage from "../../app/(dashboard)/journal/page";

// Create a mock for auth and prisma
const mocks = vi.hoisted(() => {
  return {
    auth: vi.fn(),
    prisma: {
      journalEntry: {
        findMany: vi.fn(),
      },
      user: {
        findUniqueOrThrow: vi.fn(),
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    route: "/",
    pathname: "/",
    query: "",
    asPath: "/",
    push: vi.fn(),
  }),
}));

const mockUser = {
  id: "user_1",
};

const mockEntries = [
  {
    id: "entry_1",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user_1",
    title: "Title 1",
    content: "Content 1",
    analysis: {
      id: "analysis_1",
      createdAt: new Date(),
      updatedAt: new Date(),
      entryId: "entry_1",
      summary: "Summary 1",
      mood: "Mood 1",
      color: JSON.stringify(["#FFFF00", "#00FFFF", "#FF00FF"]),
    },
  },
  {
    id: "entry_2",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user_1",
    title: "Title 2",
    content: "Content 2",
    analysis: {
      id: "analysis_1",
      createdAt: new Date(),
      updatedAt: new Date(),
      entryId: "entry_2",
      summary: "Summary 2",
      mood: "Mood 2",
      color: JSON.stringify(["#FF0000", "#00FF00", "#0000FF"]),
    },
  },
];

beforeEach(() => {
  mocks.auth.mockResolvedValue({
    userId: "user_1",
  });
  mocks.prisma.user.findUniqueOrThrow.mockResolvedValueOnce(mockUser);
  mocks.prisma.journalEntry.findMany.mockResolvedValueOnce(mockEntries);
});

describe("JournalPage", () => {
  test("renders Question component", async () => {
    render(await JournalPage());

    const questionElement = screen.getByTestId("question");
    expect(questionElement).toBeInTheDocument();
  });

  test("renders correct number of EntryCard components", async () => {
    render(await JournalPage());

    const entryCardElements = screen.getAllByTestId("entry-card");
    expect(entryCardElements).toHaveLength(mockEntries.length);
  });

  test("checks content of EntryCard components", async () => {
    render(await JournalPage());

    const entryCardElements = screen.getAllByTestId("entry-card");
    entryCardElements.forEach((element, index) => {
      expect(element.textContent).toContain(
        mockEntries[index].analysis.summary
      );
    });
  });
});
