import { POST } from "@/app/api/journal/route";

// Create mocks for getUserByClerkID and prisma.journalEntry.create
const mocks = vi.hoisted(() => {
  return {
    getUserByClerkID: vi.fn(),
    create: vi.fn(),
  };
});

// Mock getUserByClerkID and prisma.journalEntry.create
vi.mock("@/utils/auth", () => {
  return {
    getUserByClerkID: mocks.getUserByClerkID,
  };
});
vi.mock("@/utils/db", () => {
  return {
    prisma: {
      journalEntry: {
        create: mocks.create,
      },
    },
  };
});

describe("POST /api/route", () => {
  it("should create a journal entry and return it", async () => {
    // Use the mocks
    mocks.getUserByClerkID.mockResolvedValue({ id: "mockUserId" });
    mocks.create.mockResolvedValue({
      userId: "mockUserId",
      content:
        "Share your day with us! Mood analysis will begin shortly after you finish writing.",
    });

    const result = await POST();

    expect(result).toHaveProperty("json");
    const jsonData = await result.json();
    expect(jsonData).toHaveProperty("data");
    expect(jsonData.data).toHaveProperty(
      "content",
      "Share your day with us! Mood analysis will begin shortly after you finish writing."
    );
  });
  it("should fail if there is no user", async () => {
    mocks.getUserByClerkID.mockResolvedValue(null);
    await expect(POST()).rejects.toThrow();
  });
});
