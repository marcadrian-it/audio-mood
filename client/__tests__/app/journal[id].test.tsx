import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import JournalIdPage from "@/app/(dashboard)/journal/[id]/page";

vi.mock("@/components/Recorder", () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mock Recorder</div>;
    },
  };
});

// Create a mock for auth and prisma
const mocks = vi.hoisted(() => {
  return {
    getUserMedia: vi.fn(),
    auth: vi.fn(),
    prisma: {
      journalEntry: {
        findUnique: vi.fn(),
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

const mockUser = {
  id: "user_1",
};

const mockEntry = {
  id: "entry_1",
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user_1",
  title: "Title 1",
  content: "Content 1",
};

beforeEach(() => {
  mocks.auth.mockResolvedValue({
    userId: "user_1",
  });
});

test("JournalIdPage with entry", async () => {
  mocks.auth.mockResolvedValue({ userId: "user_1" });
  mocks.prisma.user.findUniqueOrThrow.mockResolvedValueOnce(mockUser);
  mocks.prisma.journalEntry.findUnique.mockResolvedValueOnce(mockEntry);

  render(await JournalIdPage({ params: { id: "entry_1" } }));
  expect(screen.getByText("Content 1")).toBeTruthy();
});

test("JournalIdPage without an entry", async () => {
  mocks.auth.mockResolvedValue({ userId: "user_1" });
  mocks.prisma.user.findUniqueOrThrow.mockResolvedValueOnce(mockUser);
  mocks.prisma.journalEntry.findUnique.mockResolvedValueOnce(null);
  render(await JournalIdPage({ params: { id: "entry_1" } }));
});
