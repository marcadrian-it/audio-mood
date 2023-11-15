import { POST } from "@/app/api/question/route";

// Create mocks for getUserByClerkID, prisma.journalEntry.findMany, and qa
const mocks = vi.hoisted(() => {
  return {
    getUserByClerkID: vi.fn(),
    findMany: vi.fn(),
    qa: vi.fn(),
  };
});

// Mock getUserByClerkID, prisma.journalEntry.findMany, and qa
vi.mock("@/utils/auth", () => {
  return {
    getUserByClerkID: mocks.getUserByClerkID,
  };
});
vi.mock("@/utils/db", () => {
  return {
    prisma: {
      journalEntry: {
        findMany: mocks.findMany,
      },
    },
  };
});
vi.mock("@/utils/ai", () => {
  return {
    qa: mocks.qa,
  };
});

describe("POST /api/question", () => {
  it("should return the answer to the question", async () => {
    const mockRequest = {
      json: async () => ({ question: "mock question" }),
    } as any as Request;
    const mockDate = new Date();
    mocks.getUserByClerkID.mockResolvedValue({ id: "mockUserId" });
    mocks.findMany.mockResolvedValue([
      { id: "mockEntryId", createdAt: mockDate, content: "mock content" },
    ]);
    mocks.qa.mockResolvedValue("mock answer");

    const response = await POST(mockRequest);

    const responseBody = await response.json();

    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({ data: "mock answer" });
    expect(mocks.getUserByClerkID).toHaveBeenCalled();
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        userId: "mockUserId",
      },
      select: {
        id: true,
        createdAt: true,
        content: true,
      },
    });
    expect(mocks.qa).toHaveBeenCalledWith("mock question", [
      { id: "mockEntryId", createdAt: mockDate, content: "mock content" },
    ]);
  });
});
