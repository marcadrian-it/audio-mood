import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import JournalIdPage from "@/app/(dashboard)/journal/[id]/page";

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

vi.mock("@/components/Recorder", () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mock Recorder</div>;
    },
  };
});

const user = {
  id: "user_1",
};

const entry = {
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
  mocks.prisma.user.findUniqueOrThrow.mockResolvedValueOnce(user);
  mocks.prisma.journalEntry.findUnique.mockResolvedValueOnce(entry);

  render(await JournalIdPage({ params: { id: "entry_1" } }));
  expect(screen.getByText("Content 1")).toBeTruthy();
});

test("JournalIdPage without an entry", async () => {
  mocks.auth.mockResolvedValue({ userId: "user_1" });
  mocks.prisma.user.findUniqueOrThrow.mockResolvedValueOnce(user);
  mocks.prisma.journalEntry.findUnique.mockResolvedValueOnce(null);
  render(await JournalIdPage({ params: { id: "entry_1" } }));
  expect(screen.getByText("Entry not found")).toBeTruthy();
});
