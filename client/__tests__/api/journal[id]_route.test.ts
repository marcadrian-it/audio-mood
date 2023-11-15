import { PATCH } from "@/app/api/journal/[id]/route";
import httpMocks from "node-mocks-http";

// Create mocks for getUserByClerkID, prisma.journalEntry.update and prisma.analysis.upsert
const mocks = vi.hoisted(() => {
  return {
    getUserByClerkID: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    OpenAI: vi.fn().mockImplementation(() => {
      return { call: vi.fn().mockResolvedValue({ data: "mocked data" }) };
    }),
  };
});

// Mock getUserByClerkID, prisma.journalEntry.update and prisma.analysis.upsert
vi.mock("@/utils/auth", () => {
  return {
    getUserByClerkID: mocks.getUserByClerkID,
  };
});
vi.mock("@/utils/db", () => {
  return {
    prisma: {
      journalEntry: {
        update: mocks.update,
      },
      analysis: {
        upsert: mocks.upsert,
      },
    },
  };
});

vi.mock("@/utils/openai", () => {
  return {
    OpenAI: mocks.OpenAI,
  };
});

vi.mock("@/utils/ai", () => {
  return {
    analyze: vi.fn().mockResolvedValue({ data: "mocked data" }),
  };
});

describe("PATCH /api/journal/[id]", () => {
  it("should update a journal entry and return it", async () => {
    mocks.getUserByClerkID.mockResolvedValue({ id: "mockUserId" });
    mocks.update.mockResolvedValue({
      userId: "mockUserId",
      content: "Updated content",
    });
    mocks.upsert.mockResolvedValue({});

    const mockRequest = httpMocks.createRequest({
      method: "PATCH",
      url: "/api/journal/mockEntryId",
      body: { content: "Updated content" },
    }) as any as Request;
    mockRequest.json = async () => mockRequest.body;
    const mockParams = { id: "mockEntryId" };

    const result = await PATCH(mockRequest, { params: mockParams });

    expect(result).toHaveProperty("json");
    const jsonData = await result.json();
    expect(jsonData).toHaveProperty("data");
    expect(jsonData.data).toHaveProperty("content", "Updated content");
  });
  it("should fail if there is no user", async () => {
    mocks.getUserByClerkID.mockResolvedValue(null);
    const mockRequest = httpMocks.createRequest({
      method: "PATCH",
      url: "/api/journal/mockEntryId",
      body: { content: "Updated content" },
    });
    mockRequest.json = async () => mockRequest.body;
    const mockParams = { id: "mockEntryId" };

    await expect(
      PATCH(mockRequest as any as Request, { params: mockParams })
    ).rejects.toThrow();
  });
});
